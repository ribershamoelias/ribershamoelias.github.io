// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Referenz zum Overlay und zum Schließen-Button
    const myOverlay = document.getElementById('myOverlay');
    const closeBtn = document.querySelector('.close-btn');

    // Funktion zum Öffnen des Overlays
    function openOverlay() {
        myOverlay.style.display = 'flex'; // Ändere display zu 'flex', um es anzuzeigen und zu zentrieren
    }

    // Funktion zum Schließen des Overlays
    function closeOverlay() {
        myOverlay.style.display = 'none';
    }

    // Event-Listener für den Schließen-Button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeOverlay);
    }

    // Optional: Overlay schließen, wenn außerhalb des Inhalts geklickt wird
    if (myOverlay) {
        myOverlay.addEventListener('click', (event) => {
            if (event.target === myOverlay) { // Prüfen, ob der Klick auf das Overlay selbst war, nicht auf den Inhalt
                closeOverlay();
            }
        });
    }

    // Exponiere die Funktionen global, damit sie von anderen HTML-Dateien aus aufgerufen werden können
    window.openOverlay = openOverlay;
    window.closeOverlay = closeOverlay;

    // Beispiel: Wenn du das Overlay direkt laden möchtest, wenn die overlay.html aufgerufen wird
    // myOverlay.style.display = 'flex';
});
