import urllib.request
import json
import urllib.parse

def test_repo_search(query):
    url = f'https://api.github.com/search/repositories?q={urllib.parse.quote(query)}&sort=updated&per_page=6'
    req = urllib.request.Request(url, headers={'User-Agent': 'LeadHunter-AI-Harvester'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"\n=== Query: {query} ===")
            print(f"Total matching repositories: {data.get('total_count', 0)}")
            for repo in data.get('items', []):
                print(f"-> {repo['full_name']} (⭐ {repo['stargazers_count']})")
                print(f"   Desc: {repo.get('description')}")
                print(f"   URL: {repo['html_url']}")
                print(f"   Topics: {', '.join(repo.get('topics', []))}")
                print(f"   Owner: {repo['owner']['login']}")
                print("-" * 40)
    except Exception as e:
        print(f"Error querying {query}: {e}")

# 1. Search for AI / Web repos hiring contractors & engineers
test_repo_search('"we are hiring" in:readme stars:>200 language:typescript')
test_repo_search('"looking for contractors" in:readme')
test_repo_search('"bounty" in:readme stars:>500')
