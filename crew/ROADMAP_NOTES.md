# Crew Geliştirme Notları

## Sprint 6 Sonrası (#10)
1. Custom tool'lar — check_css_violations + run_type_check agent'a eklenir
2. Paralel çalışma — ThreadPoolExecutor
3. Dashboard timer — her agent için süre
4. Orkestratör/worker model ayrımı — TensorPM pattern (qwen2.5-coder:7b orkestratör, 32b worker)
5. DESIGN.md — Vasi tasarım token'ları, UX/UI agent her görev başında okur (Galyarder pattern)
6. LOG_PROJECTS.md + LOG_CHARTERS.md — kalıcı proje hafızası

## Sprint 7 Adayı (kendi geliştirmeler yetmezse)
- **Claudish** — smolagents'ı bırak, Claude Code altyapısını Ollama'ya bağla
  - Repo: https://github.com/MadAppGang/claudish
  - Fayda: Claude Code'un agent loop + error recovery + tool use'u, local model ile
  - MadAppGang skill'leri: agent-coordination-discipline, multi-model-validation, error-recovery
  - Karar: Sprint 6 sonrası kendi geliştirmeler test edilecek, çalışmazsa Sprint 7'de geçilecek

## local-llm-router (Sprint 6 sonrası #10'a eklenecek)
- Görev karmaşıklığına göre otomatik model seçimi
- Basit görevler (CSS düzeltme, dokümantasyon) → qwen2.5-coder:7b
- Karmaşık görevler (kod yazma, mimari) → qwen2.5-coder:32b
- TensorPM + DESIGN.md + local-llm-router üçlüsü birlikte çalışacak
- Referans: https://playbooks.com/skills/hoodini/ai-agents-skills/local-llm-router
