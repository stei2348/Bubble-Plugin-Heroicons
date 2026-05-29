function(instance, context) {
    // Creiamo il div marcatore
    var div = document.createElement('div');
    
    // Assegniamo la classe fondamentale
    div.className = 'pdf-page-break-marker';
    
    // --- STILE VISUALE EDITOR (Solo per te, per vederlo mentre lavori) ---
    div.style.width = '100%';
    div.style.height = '20px'; // Un po' di altezza per vederlo bene
    div.style.background = 'repeating-linear-gradient(45deg, #ffe6e6, #ffe6e6 10px, #fff 10px, #fff 20px)';
    div.style.borderTop = '2px dashed red';
    div.style.borderBottom = '2px dashed red';
    div.style.position = 'relative';
    div.style.color = 'red';
    div.style.fontWeight = 'bold';
    div.style.fontSize = '10px';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.innerText = "--- PAGE BREAK ---";

    instance.canvas.append(div);
}