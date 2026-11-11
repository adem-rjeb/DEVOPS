import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthForm from "@/components/AuthForm";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

describe("AuthForm", () => {
  it("affiche les champs de connexion", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeInTheDocument();
  });
});
