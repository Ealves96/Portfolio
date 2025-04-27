// HistoryManager.js (Corrigé)

class HistoryManager {
    constructor() {
        this.states = new Map(); // Garde les handlers de FERMETURE
        this.currentState = null; // Garde une trace de l'état actuel géré par le manager
        this.init();
    }

    init() {
        // Garde une référence pour pouvoir retirer l'écouteur si besoin
        this.popstateHandler = (event) => {
            console.log("[Popstate] Event:", event.state); // Log l'état reçu
            const stateType = event.state ? event.state.type : null;

            // Si on revient à un état qui n'est PAS celui géré actuellement, 
            // ET qu'un état était précédemment actif, on appelle son handler de fermeture.
            if (stateType !== this.currentState && this.currentState !== null) {
                 console.log(`[Popstate] Retour depuis l'état '${this.currentState}'. Appel du handler.`);
                 const closeHandler = this.states.get(this.currentState);
                 if (closeHandler) {
                     closeHandler(); // Appelle la fonction de fermeture (ex: closeStories)
                 }
                 this.currentState = null; // Réinitialise l'état géré
            } else if (stateType === this.currentState) {
                 console.log(`[Popstate] Rechargement de l'état '${stateType}' (ne devrait pas arriver avec back).`);
                 // Normalement, on ne devrait pas revenir au même état avec 'back'
            } else {
                 console.log("[Popstate] Retour à un état initial ou non géré.");
                 // S'assurer qu'aucun état géré n'est actif
                 this.currentState = null; 
            }
        };

        window.addEventListener('popstate', this.popstateHandler);
    }

    // Enregistrer un type d'état et sa fonction de FERMETURE
    register(type, closeHandler) {
        if (typeof closeHandler !== 'function') {
             console.error(`HistoryManager: Le handler pour le type '${type}' n'est pas une fonction.`);
             return;
        }
        this.states.set(type, closeHandler);
        console.log(`[HistoryManager] Handler enregistré pour: ${type}`);
    }

    // Ouvrir un nouvel état (push dans l'historique)
    push(type, data = {}) {
         // Vérifier si le type est enregistré
         if (!this.states.has(type)) {
              console.warn(`HistoryManager: Tentative de push d'un type non enregistré '${type}'. Enregistrez-le d'abord avec register().`);
              // Optionnel: Enregistrer avec une fonction vide pour éviter erreur popstate ?
              // this.register(type, () => {});
         }
        console.log(`[HistoryManager] Push état: ${type}`);
        window.history.pushState({ type, ...data }, ''); // L'URL ne change pas
        this.currentState = type; // Mémorise l'état actuel
    }

    // Fermer l'état actuel (via bouton X ou autre action manuelle)
    // Appelle history.back() qui déclenchera ensuite onpopstate
    back() {
        console.log("[HistoryManager] Appel de history.back()");
        // On NE met PAS currentState à null ici, c'est le onpopstate qui le fera
        window.history.back();
    }

     // Méthode pour indiquer qu'un état est fermé sans utiliser history.back()
     // (utile si la fermeture est déclenchée autrement que par history.back)
     notifyStateClosed(type) {
          if (this.currentState === type) {
               console.log(`[HistoryManager] État '${type}' notifié comme fermé.`);
               this.currentState = null;
          }
     }
}

// Créer une instance globale (si ce n'est pas déjà fait ailleurs)
// Assure-toi que ce code ne s'exécute qu'une seule fois
if (!window.historyManager) {
    window.historyManager = new HistoryManager();
} else {
     console.warn("HistoryManager déjà initialisé.");
}