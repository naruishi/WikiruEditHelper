import os
from pathlib import Path
try:
    from bs4 import BeautifulSoup
except ImportError:
    print("❌ BeautifulSoup (bs4) がインストールされていません。")
    print("次を実行してください: pip install beautifulsoup4")
    input("\n[Enter]キーを押して終了...")
    exit(1)


def collect_html_files(root_dir):
    html_files = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.html'):
                full_path = os.path.join(dirpath, filename)
                relative_path = os.path.relpath(full_path, root_dir).replace(os.sep, '/')
                # ルート直下の index.html は除外、それ以外は対象
                if not (relative_path == 'index.html'):
                    html_files.append((full_path, relative_path))
    return html_files

def extract_title_and_description(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
            title = soup.title.string.strip() if soup.title and soup.title.string else "(no title)"
            for tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                heading = soup.find(tag)
                if heading:
                    return title, heading.get_text(strip=True)
            return title, ""
    except Exception as e:
        print(f"解析失敗: {file_path} ({e})")
        return "(読み込み失敗)", ""

def generate_index_html(file_infos, output_path):
    lines = [
        '<html>',
        '<head><meta charset="utf-8"><title>HTML Index</title></head>',
        '<body>',
        '<h1>HTML ファイル一覧</h1>',
        '<ul>'
    ]
    for rel_path, title, desc in sorted(file_infos, key=lambda x: x[1].lower()):
        desc_html = f'<br><small>{desc}</small>' if desc else ''
        lines.append(f'<li><a href="{rel_path}">{title}</a>{desc_html}</li>')
    lines += ['</ul>', '</body>', '</html>']

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"\n✅ index.html を生成しました: {output_path}")

def main():
    try:
        root = Path.cwd()
        print(f"🔍 探索ルート: {root}")

        html_files = collect_html_files(root)
        print(f"🔗 HTMLファイル数: {len(html_files)}")

        file_infos = []
        for full_path, rel_path in html_files:
            title, desc = extract_title_and_description(full_path)
            print(f"📄 {rel_path}: {title} / {desc}")
            file_infos.append((rel_path, title, desc))

        generate_index_html(file_infos, root / 'index.html')
        print("\n✅ index.html を生成しました。")
    except Exception as e:
        print(f"❌ エラー発生: {e}")
    finally:
        input("\n[Enter]キーを押して終了...")


if __name__ == '__main__':
    main()
