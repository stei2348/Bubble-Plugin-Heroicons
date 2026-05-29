function(instance, context) {
    // 1. Inseriamo lo stile CSS per la stampa (una volta sola per pagina)
    if (!document.getElementById('pdf-page-break-style')) {
        var style = document.createElement('style');
        style.id = 'pdf-page-break-style';
        style.innerHTML = `
            @media print {
                .pdf-page-break-marker {
                    display: block !important;
                    page-break-before: always !important;
                    break-before: always !important;
                    height: 0px !important;
                    visibility: hidden !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Creiamo il div marcatore
    var div = document.createElement('div');
    div.className = 'pdf-page-break-marker';
    
    // Stile VISIBILE solo per l'editor/browser (per capire dove sta il break)
    // Quando Puppeteer stamperà, userà la classe @media print qui sopra che lo nasconde
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.borderTop = '2px dashed #ff0000';
    div.style.position = 'relative';
    div.style.opacity = '0.5';

    // Etichetta visuale
    var label = document.createElement('div');
    label.innerHTML = "PAGE BREAK";
    label.style.color = "#ff0000";
    label.style.fontSize = "10px";
    label.style.position = "absolute";
    label.style.top = "-15px";
    label.style.left = "0";

    div.appendChild(label);
    instance.canvas.append(div);
}