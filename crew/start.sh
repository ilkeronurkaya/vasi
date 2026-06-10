#!/bin/bash
# Vasi — Geliştirme Ortamını Başlat
# Kullanım: ./start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "🕰️  Vasi Agent Manager başlatılıyor..."
echo ""

# ── 1. Ollama ────────────────────────────────────────────────────────────────
if pgrep -x "ollama" > /dev/null; then
  echo "✅ Ollama zaten çalışıyor"
else
  echo "🚀 Ollama başlatılıyor (flash attention + q8_0 KV cache)..."
  OLLAMA_FLASH_ATTENTION="1" OLLAMA_KV_CACHE_TYPE="q8_0" \
    /usr/local/bin/ollama serve &
  OLLAMA_PID=$!
  echo "   PID: $OLLAMA_PID"

  # Hazır olana kadar bekle
  echo -n "   Bekleniyor"
  for i in {1..15}; do
    sleep 1
    echo -n "."
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
      echo " hazır!"
      break
    fi
  done
fi

# Model var mı kontrol et
if ! ollama list 2>/dev/null | grep -q "qwen2.5-coder:32b"; then
  echo ""
  echo "⚠️  Model bulunamadı. İndiriliyor (~20GB)..."
  ollama pull qwen2.5-coder:32b
fi

echo ""

# ── 2. Python venv ───────────────────────────────────────────────────────────
if [ ! -d "$SCRIPT_DIR/.venv" ]; then
  echo "🐍 Python sanal ortamı oluşturuluyor..."
  python3 -m venv "$SCRIPT_DIR/.venv"
  source "$SCRIPT_DIR/.venv/bin/activate"
  pip install -q -r "$SCRIPT_DIR/requirements.txt"
  echo "✅ Python bağımlılıkları yüklendi"
else
  source "$SCRIPT_DIR/.venv/bin/activate"
  echo "✅ Python ortamı aktif"
fi

echo ""

# ── 3. Chainlit ──────────────────────────────────────────────────────────────
echo "💬 Agent Manager açılıyor → http://localhost:8000"
echo "   Durdurmak için: Ctrl+C"
echo ""

cd "$SCRIPT_DIR"
chainlit run manager.py
