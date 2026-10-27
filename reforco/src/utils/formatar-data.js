export function formatarData(valor) {
    const d = new Date(valor)
    if (Number isNaN(d.getTime))) {
        throw new Error('Data invalida')
    }
    const dia = String(d.getDate()).padStart(2,'0')
    const mes = String(d.getMonth() +1).pad
    const ano = d.getFullYear()
    return
}