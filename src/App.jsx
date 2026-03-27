import React, { useMemo, useState } from 'react'
import { BarChart, Bar, CartesianGrid, Cell, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { salesData as initialData, recommendations } from './sampleData'
import { brl, pct, parseExcel } from './utils'

const COLORS = ['#6d8cff', '#55d6be', '#f7b267', '#f4845f', '#9d79d6']

function App() {
  const [data, setData] = useState(initialData)
  const [rawRows, setRawRows] = useState([])

  const totals = useMemo(() => {
    const investimento = data.reduce((s, i) => s + Number(i.investimento || 0), 0)
    const receita = data.reduce((s, i) => s + Number(i.receita || 0), 0)
    const roas = investimento ? receita / investimento : 0
    const tacos = receita ? (investimento / receita) * 100 : 0
    return { investimento, receita, roas, tacos }
  }, [data])

  const topCampaigns = useMemo(() => [...data].sort((a, b) => b.receita - a.receita), [data])

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    parseExcel(file, (rows) => {
      setRawRows(rows)
      const mapped = rows.slice(0, 20).map((row, idx) => ({
        campanha: row['Nome da Campanha'] || row['Campanha'] || row['Título'] || `Campanha ${idx + 1}`,
        investimento: Number(row['Investimento'] || row['Custo'] || row['Ads Spend'] || 0),
        receita: Number(row['Receita'] || row['Vendas Brutas'] || row['Sales'] || 0),
        roas: Number(row['ROAS'] || 0),
        impressoes: Number(row['Impressões'] || row['Impressoes'] || 0),
        cliques: Number(row['Cliques'] || 0),
        cvr: Number(row['CVR'] || row['Conversão'] || 0),
      })).filter(i => i.campanha)
      if (mapped.length) setData(mapped)
    })
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">Mercado Livre Ads</span>
          <h1>MelieAds Dashboard</h1>
          <p>Analise campanhas, visualize os KPIs principais e organize ações estratégicas em um painel pronto para GitHub e Netlify.</p>
        </div>
        <label className="upload-box">
          <span>Importar planilha Excel</span>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} />
          <small>O painel funciona com dados de exemplo e pode receber uma planilha simples para atualizar os cards.</small>
        </label>
      </header>

      <section className="stats-grid">
        <StatCard title="Investimento" value={brl(totals.investimento)} />
        <StatCard title="Receita" value={brl(totals.receita)} />
        <StatCard title="ROAS" value={`${totals.roas.toFixed(2)}x`} />
        <StatCard title="TACOS" value={pct(totals.tacos)} />
      </section>

      <section className="content-grid">
        <div className="panel chart-panel large">
          <div className="panel-header">
            <h2>Receita por campanha</h2>
            <p>Visão rápida das campanhas mais relevantes.</p>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topCampaigns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3557" />
                <XAxis dataKey="campanha" tick={{ fill: '#cfd6ff', fontSize: 12 }} />
                <YAxis tick={{ fill: '#cfd6ff', fontSize: 12 }} />
                <Tooltip formatter={(v) => brl(v)} contentStyle={{ background: '#151a2d', border: '1px solid #29314f', borderRadius: 12 }} />
                <Bar dataKey="receita" radius={[10, 10, 0, 0]}>
                  {topCampaigns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <h2>Participação da receita</h2>
            <p>Distribuição das principais campanhas.</p>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={topCampaigns} dataKey="receita" nameKey="campanha" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {topCampaigns.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => brl(v)} contentStyle={{ background: '#151a2d', border: '1px solid #29314f', borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="content-grid second-row">
        <div className="panel">
          <div className="panel-header">
            <h2>Plano de ação sugerido</h2>
            <p>Bloco pronto para orientar ajustes nos próximos 15 dias.</p>
          </div>
          <div className="recommendation-list">
            {recommendations.map((item) => (
              <article className="recommendation" key={item.tipo}>
                <strong>{item.tipo}</strong>
                <p>{item.descricao}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Tabela rápida</h2>
            <p>Resumo das campanhas carregadas no painel.</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Campanha</th>
                  <th>Investimento</th>
                  <th>Receita</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((item) => (
                  <tr key={item.campanha}>
                    <td>{item.campanha}</td>
                    <td>{brl(item.investimento)}</td>
                    <td>{brl(item.receita)}</td>
                    <td>{item.roas ? `${Number(item.roas).toFixed(2)}x` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="panel raw-panel">
        <div className="panel-header">
          <h2>Linhas importadas</h2>
          <p>{rawRows.length ? `${rawRows.length} linhas encontradas no arquivo enviado.` : 'Nenhuma planilha importada ainda. O painel está com dados de exemplo.'}</p>
        </div>
        <pre>{rawRows.length ? JSON.stringify(rawRows.slice(0, 8), null, 2) : 'Envie uma planilha para visualizar uma prévia dos dados lidos.'}</pre>
      </section>
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <div className="stat-card panel">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
