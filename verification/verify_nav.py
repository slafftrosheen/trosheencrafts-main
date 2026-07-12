import json
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Go to home page
    page.goto("http://localhost:5173/")

    # Check for Gallery link in main nav
    # The desktop nav is visible on large screens.
    # By default playwright uses 1280x720 which is > lg (1024px).
    expect(page.get_by_role("link", name="Gallery").first).to_be_visible()

    # Take screenshot of nav
    page.screenshot(path="verification/nav_check.png")

    # Check mobile nav
    page.set_viewport_size({"width": 375, "height": 667})
    page.reload() # Reload to ensure mobile layout applies if needed

    # Open mobile menu
    page.get_by_role("button").last.click() # Assuming the menu button is the last button or I can search for Menu icon

    # Wait for menu
    expect(page.get_by_text("Menu")).to_be_visible()

    # Check for Gallery link in mobile menu
    expect(page.get_by_role("link", name="Gallery")).to_be_visible()

    page.screenshot(path="verification/mobile_nav_check.png")

    print("Navigation checks passed.")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
