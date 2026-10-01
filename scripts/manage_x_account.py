import asyncio
import sys

try:
    from twscrape import AccountsPool
except ImportError:
    print("twscrape not installed. Run 'pip install twscrape'")
    sys.exit(1)

async def main():
    pool = AccountsPool()

    if len(sys.argv) < 2:
        print("=" * 60)
        print("  LeadHunter 𝕏 (Twitter) Account Manager")
        print("=" * 60)
        print("\nCommands:")
        print("  1. Add Browser Cookies (Bypasses Cloudflare 100%):")
        print("     python scripts/manage_x_account.py add_cookie <username> <auth_token> <ct0>")
        print("\n  2. Add Password Login:")
        print("     python scripts/manage_x_account.py add <username> <password> <email> <email_password>")
        print("\n  3. List active accounts:")
        print("     python scripts/manage_x_account.py list")
        print("=" * 60)
        accounts = await pool.accounts_info()
        print(f"\nCurrent accounts in pool: {len(accounts)}")
        for acc in accounts:
            print(f" - @{acc['username']} | logged_in: {acc['logged_in']} | active: {acc['active']}")
        return

    cmd = sys.argv[1].lower()

    if cmd == 'list':
        accounts = await pool.accounts_info()
        print(f"Total accounts in pool: {len(accounts)}")
        for acc in accounts:
            print(f" - @{acc['username']} | logged_in: {acc['logged_in']} | active: {acc['active']}")

    elif cmd == 'add_cookie':
        if len(sys.argv) < 5:
            print("\nUsage:")
            print("  python scripts/manage_x_account.py add_cookie <username> <auth_token> <ct0>")
            print("\nExample:")
            print("  python scripts/manage_x_account.py add_cookie leadradarbx 4a9f8c... 9b2c1d...")
            return

        username = sys.argv[2]
        auth_token = sys.argv[3]
        ct0 = sys.argv[4]

        cookie_str = f"auth_token={auth_token}; ct0={ct0}"
        
        # Add account with cookies
        await pool.add_account_cookies(username, cookie_str)
        print(f"\n✅ Account @{username} successfully activated with Browser Cookies!")
        print("🚀 Cloudflare bypassed! You can now run: python scripts/x_radar_scraper.py")

    elif cmd == 'add':
        if len(sys.argv) < 6:
            print("Error: Need username password email email_password")
            print("Example: python scripts/manage_x_account.py add myuser mypass myemail@gmail.com myemailpass")
            return
        username, password, email, email_password = sys.argv[2:6]
        await pool.add_account(username, password, email, email_password)
        print(f"Account @{username} added! Attempting login...")
        try:
            await pool.login_all()
            print("Login complete!")
        except Exception as e:
            print(f"Login error: {e}")

if __name__ == '__main__':
    asyncio.run(main())
