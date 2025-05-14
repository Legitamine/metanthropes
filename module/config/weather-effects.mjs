export function metaRegisterWeatherEffects() {
	CONFIG.weatherEffects["nether"] = {
		id: "nether",
		label: "nether",
		filter: {
			enabled: false,
		},
		effects: [
			{
				id: "netherLevel1",
				effectClass: WeatherShaderEffect,
				shaderClass: SnowShader,
				blendMode: PIXI.BLEND_MODES.SCREEN,
				config: {
					tint: [0.35, 0.25, 0.25],
					direction: 0.5,
					
					speed: 0.5,
					scale: 2,
				},
			},
		],
	};
}
