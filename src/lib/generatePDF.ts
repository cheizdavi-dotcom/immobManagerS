import jsPDF from 'jspdf'
import { format } from 'date-fns'

export function generateSalePDF(sale: any, companySettings?: any) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 18
  const rightMargin = pageWidth - margin
  let y = 22

  doc.setFillColor(30, 41, 59)
  doc.rect(0, 0, pageWidth, 42, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Proposta Comercial', margin, y + 6)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Documento de Registro de Venda', margin, y + 16)

  y = 52

  if (companySettings?.companyName) {
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7)
    doc.text('EMPRESA', margin, y)
    y += 5
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(companySettings.companyName, margin, y)
    if (companySettings.cnpj) {
      y += 5
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`CNPJ: ${companySettings.cnpj}`, margin, y)
    }
    y += 10
  }

  doc.setDrawColor(200, 210, 220)
  doc.setLineWidth(0.4)
  doc.line(margin, y, rightMargin, y)
  y += 10

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.text('DADOS DO CLIENTE', margin, y)
  y += 5
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(sale.client?.name || 'Não informado', margin, y)
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (sale.client?.phone) doc.text(`Tel: ${sale.client.phone}`, margin, y)
  if (sale.client?.email) {
    if (sale.client?.phone) y += 4
    doc.text(`E-mail: ${sale.client.email}`, margin, y)
  }
  if (!sale.client?.phone && !sale.client?.email) {
    doc.text('Contato não informado', margin, y)
  }
  y += 10

  doc.line(margin, y, rightMargin, y)
  y += 8

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.text('DADOS DO IMÓVEL', margin, y)
  y += 5
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(sale.development?.name || 'Não informado', margin, y)
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (sale.development?.builder) {
    doc.text(`Construtora: ${sale.development.builder}`, margin, y)
    y += 4
  }
  if (sale.development?.address) {
    doc.text(`Endereço: ${sale.development.address}`, margin, y)
  } else {
    doc.text('Endereço não informado', margin, y)
  }
  y += 10

  doc.line(margin, y, rightMargin, y)
  y += 8

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.text('DADOS DA VENDA', margin, y)
  y += 8

  const col1 = margin
  const col2 = pageWidth / 2

  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.text('Valor da Venda:', col1, y)
  doc.text('Entrada:', col2, y)

  y += 5
  doc.setFontSize(12)
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'bold')
  const money = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  doc.text(money(sale.amount), col1, y)
  doc.text(money(sale.downPayment), col2, y)

  y += 10
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.text('Comissão (%):', col1, y)
  doc.text('Valor da Comissão:', col2, y)

  y += 5
  doc.setFontSize(12)
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'bold')
  doc.text(`${sale.commissionRate || 0}%`, col1, y)
  doc.setTextColor(22, 118, 59)
  doc.text(money(sale.commissionValue), col2, y)

  y += 10
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.text('Status:', margin, y)
  doc.setFontSize(10)
  const statusLabels: Record<string, string> = {
    PROSPECT: 'Prospecção',
    ANALISE_CREDITO: 'Análise de Crédito',
    ASSINATURA: 'Em Assinatura',
    WON: 'Concluída',
    LOST: 'Cancelada'
  }
  doc.setTextColor(30, 41, 59)
  doc.text(statusLabels[sale.status] || sale.status, margin + 22, y)
  y += 12

  doc.line(margin, y, rightMargin, y)
  y += 8

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.text('CORRETOR RESPONSÁVEL', margin, y)
  y += 5
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(sale.broker?.name || 'Não informado', margin, y)
  if (sale.broker?.creci) {
    y += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`CRECI: ${sale.broker.creci}`, margin, y)
  }
  y += 10

  if (sale.notes) {
    doc.line(margin, y, rightMargin, y)
    y += 8
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7)
    doc.text('OBSERVAÇÕES', margin, y)
    y += 5
    doc.setTextColor(71, 85, 105)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(sale.notes, rightMargin - margin)
    doc.text(lines, margin, y)
  }

  y = pageHeight - 15
  doc.line(margin, y - 5, rightMargin, y - 5)
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7)
  doc.text(`Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, margin, y)

  doc.save(`proposta-${sale.client?.name?.replace(/\s/g, '-') || 'venda'}-${format(new Date(), 'ddMMyyyy')}.pdf`)
}
