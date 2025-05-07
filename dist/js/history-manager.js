class HistoryManager {
	constructor() {
		this.states = new Map();
		this.currentState = null;
		this.isPopping = false;
		this.init();
	}

	init() {
		this.popstateHandler = (event) => {
			this.isPopping = true;
			 ("[Popstate] Event:", event.state);
			const stateType = event.state ? event.state.type : null;

			if (stateType !== this.currentState && this.currentState !== null) {
				 (`[Popstate] Fermeture de l'état '${this.currentState}'`);
				const closeHandler = this.states.get(this.currentState);
				if (closeHandler) {
					try {
						closeHandler();
					} catch (e) {
						console.error("Erreur lors de la fermeture:", e);
					}
				}
			}

			this.currentState = stateType;
			this.isPopping = false;
		};

		window.addEventListener('popstate', this.popstateHandler);
	}

	register(type, closeHandler) {
		if (typeof closeHandler !== 'function') {
			console.error(`HistoryManager: Handler invalide pour '${type}'`);
			return;
		}
		this.states.set(type, closeHandler);
		 (`[HistoryManager] Enregistrement: ${type}`);
	}

	push(type, data = {}) {
		if (!this.states.has(type)) {
			console.warn(`HistoryManager: Type non enregistré '${type}'`);
			return;
		}
		 (`[HistoryManager] Push: ${type}`);
		window.history.pushState({ type, ...data }, '');
		this.currentState = type;
	}

	back() {
		if (!this.isPopping) {
			 ("[HistoryManager] Back manuel");
			window.history.back();
		}
	}

	notifyStateClosed(type) {
		if (this.currentState === type) {
			 (`[HistoryManager] Fermeture: ${type}`);
			this.currentState = null;
		}
	}
}
// Instance unique
if (!window.historyManager) {
	window.historyManager = new HistoryManager();
}