import { test, expect } from "@playwright/test"

test.describe("Marketplace", () => {
  test("home page renders hero section", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByText("Encontre o espaço ideal para sua")
    ).toBeVisible()
    await expect(page.getByText("Buscar Salas")).toBeVisible()
    await expect(page.getByText("Anunciar Espaço")).toBeVisible()
  })

  test("home page shows how it works section", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Como funciona")).toBeVisible()
    await expect(page.getByText("1. Busque")).toBeVisible()
    await expect(page.getByText("2. Escolha")).toBeVisible()
    await expect(page.getByText("3. Contate")).toBeVisible()
  })

  test("home page shows CTA section", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByText("Tem uma clínica com espaço disponível?")
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Cadastrar Clínica Grátis" })
    ).toBeVisible()
  })

  test("marketplace page renders filters", async ({ page }) => {
    await page.goto("/anuncios")
    await expect(page.getByText("Encontrar Salas")).toBeVisible()
    await expect(page.getByText("Filtros")).toBeVisible()
  })

  test("marketplace shows empty state when no listings", async ({ page }) => {
    await page.goto("/anuncios?city=CidadeInexistente")
    await expect(
      page.getByText("Nenhum espaço encontrado com esses filtros")
    ).toBeVisible()
  })

  test("header navigation links work", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Encontrar Salas" }).click()
    await expect(page).toHaveURL("/anuncios")
  })

  test("footer renders correctly", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Conectando médicos e clínicas")).toBeVisible()
    await expect(
      page.getByText("Todos os direitos reservados")
    ).toBeVisible()
  })
})
