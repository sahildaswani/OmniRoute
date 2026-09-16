import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { useProviderModels } =
  await import("@/app/(dashboard)/dashboard/providers/hooks/useProviderModels");

type HookState = ReturnType<typeof useProviderModels>;

function response(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

async function waitFor(predicate: () => boolean, timeoutMs = 1_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error("Timed out waiting for hook state");
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
  }
}

describe("useProviderModels loading lifecycle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("settles after a successful response when the translator function changes identity", async () => {
    const fetchMock = vi.fn(async () =>
      response({ data: [{ id: "Qwen3.8-27B", owned_by: "hz" }] })
    );
    vi.stubGlobal("fetch", fetchMock);

    let result: HookState | null = null;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    function TestHook() {
      result = useProviderModels("openai-compatible-chat-test");
      return null;
    }

    await act(async () => {
      root.render(<TestHook />);
    });
    await act(async () => {
      await waitFor(() => result?.loading === false);
    });

    expect(result?.models).toEqual([{ id: "Qwen3.8-27B", owned_by: "hz" }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => root.unmount());
    container.remove();
  });
});
