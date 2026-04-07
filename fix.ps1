$path = "c:\Users\David Cheiz\.gemini\antigravity\brain\Ideias, projetos\immobmanager\src\app\dashboard\configuracoes\ConfiguracoesClient.tsx"
$content = Get-Content $path -Raw -Encoding UTF8

$find = "As chaves inseridas aqui sÃ£o cacheadas via TLS 256-bit no SQLite Master antes de serem comutadas na Edge.</p>
                </div>
                <div className="mt-8 flex justify-end gap-3">"

$replace = "As chaves inseridas aqui são cacheadas via TLS 256-bit no SQLite Master antes de serem comutadas na Edge.</p>
                </div>

                <div className="mt-6 bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 shadow-inner">
                   <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-2.5 flex items-center gap-2">
                     <ShieldCheck className="w-3.5 h-3.5" /> Instruções de Autenticação
                   </h4>
                   <p className="text-xs text-slate-400 leading-relaxed font-medium">
                     {apiModal === 'wpp' && "Para conectar o WhatsApp Business Central, acesse o painel Meta for Developers, crie um 'Aplicativo de Negócios', adicione a API do WhatsApp e gere um Token de Acesso (Permanente ou Temporário). Cole o token acima."}
                     {apiModal === 'meta' && "Para plugar as Campanhas do Meta Ads, acesse o Gerenciador de Negócios da Meta. Vá em Configurações > Fontes de Dados > Conjuntos de Dados (Pixels). Copie apenas o número da 'Identificação' (ID numérico) e cole no campo acima."}
                     {apiModal === 'rd' && "Para habilitar as Trilhas Automáticas, logue no seu RD Station Marketing. No menu superior (seu perfil), clique em 'Integrações' e depois em 'Dados de Integração (API)'. Copie o seu 'Token Privado' e insira aqui."}
                   </p>
                </div>

                <div className="mt-8 flex justify-end gap-3">"

$content = $content.Replace($find, $replace)
$content = $content.Replace("Autorizar ConexÃ£o", "Autorizar Conexão")

Set-Content -Path $path -Value $content -Encoding UTF8
