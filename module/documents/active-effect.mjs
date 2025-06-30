/**
 * Metanthropes Active Effect Document
 * todo refactor this to utilize the v12 feature of Active Effect subtypes instead of doing the ninja stuff we've been doing here
 * @extends {ActiveEffect}
 * 
 */
export class MetanthropesActiveEffect extends ActiveEffect {
	/** @override */
	/**
	 * Compute derived data related to active effect duration.
	 * @returns {{
	 *   type: string,
	 *   duration: number|null,
	 *   remaining: number|null,
	 *   label: string,
	 *   [_worldTime]: number,
	 *   [_combatTime]: number}
	 * }
	 * @internal
	 */
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ACTOR.ACTIVEEFFECT"];
	_prepareDuration() {
		const d = this.duration;

		// Time-based duration
		if (Number.isNumeric(d.seconds)) {
			const wt = game.time.worldTime;
			const start = d.startTime || wt;
			const elapsed = wt - start;
			const remaining = d.seconds - elapsed;
			return {
				type: "seconds",
				duration: d.seconds,
				remaining: remaining,
				label: `${remaining} ${game.i18n.localize("Seconds")}`,
				_worldTime: wt,
			};
		}

		// Turn-based duration
		else if (d.rounds || d.turns) {
			const cbt = game.combat;
			if (!cbt)
				return {
					type: "turns",
					_combatTime: undefined,
				};

			// Determine the current combat duration
			const c = { round: cbt.round ?? 0, turn: cbt.turn ?? 0, nTurns: cbt.turns.length || 1 };
			const current = this._getCombatTime(c.round, c.turn);
			const duration = this._getCombatTime(d.rounds, d.turns);
			const start = this._getCombatTime(d.startRound, d.startTurn, c.nTurns);

			// If the effect has not started yet display the full duration
			if (current <= start)
				return {
					type: "turns",
					duration: duration,
					remaining: duration,
					label: this._getDurationLabel(d.rounds, d.turns),
					_combatTime: current,
				};

			// Some number of remaining rounds and turns (possibly zero)
			const remaining = Math.max((start + duration - current).toNearest(0.01), 0);
			const remainingRounds = Math.floor(remaining);
			let remainingTurns = 0;
			if (remaining > 0) {
				let nt = c.turn - d.startTurn;
				while (nt < 0) nt += c.nTurns;
				remainingTurns = nt > 0 ? c.nTurns - nt : 0;
			}
			return {
				type: "turns",
				duration: duration,
				remaining: remaining,
				label: this._getDurationLabel(remainingRounds, remainingTurns),
				_combatTime: current,
			};
		}

		// No duration
		return {
			type: "none",
			duration: null,
			remaining: null,
			//label: game.i18n.localize("None"),
			label: "Permanent",
		};
	}
}
