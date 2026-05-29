function(instance, properties) {
var div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.backgroundColor = 'rgba(0, 123, 255, 0.2)';
    div.style.border = '1px solid #007bff';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.color = '#007bff';
    div.style.fontSize = '10px';
    div.style.fontWeight = 'bold';
    div.innerHTML = "NO SPLIT AREA";
    instance.canvas.append(div);
}