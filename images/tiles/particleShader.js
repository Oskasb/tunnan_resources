	var particleShader = {
		defines: {
			SPIN: true,
			BILLBOARD_TYPE: 0
		},
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexColor: MeshData.COLOR,
			vertexData: 'DATA',
			vertexOffset: 'OFFSET',
			textureTile: 'TILE'
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			particleMap: 'PARTICLE_MAP',
			cameraPosition: Shader.CAMERA,
			alphakill: 0,
			upVec: [0, 0, 1],
			dirVec: [0, 1, 0]
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec4 vertexColor;',
			'attribute vec2 vertexData;',
			'attribute vec2 vertexOffset;',
			'attribute vec4 textureTile;',
	
			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'#if BILLBOARD_TYPE == 1',
				'uniform vec3 cameraPosition;',
			'#elif BILLBOARD_TYPE == 2',
				'uniform vec3 upVec;',
				'uniform vec3 dirVec;',
			'#endif',

			'varying vec4 color;',
			'varying vec2 coords;',
	
			'void main(void) {',
				'color = vertexColor;',
				'coords = (vertexOffset * 0.5 + 0.5) * textureTile.zw + textureTile.xy;',
	
				'#ifdef SPIN',
					'float rotation = vertexData.y;',
					'float c = cos(rotation); float s = sin(rotation);',
					'mat3 spinMatrix = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);',
					'vec2 offset = (spinMatrix * vec3(vertexOffset, 1.0)).xy * vertexData.x;',
				'#else',
					'vec2 offset = vertexOffset * vertexData.x;',
				'#endif',
	
				'#if BILLBOARD_TYPE == 0', // camera facing
					'gl_Position = viewMatrix * worldMatrix * vec4(vertexPosition.xyz, 1.0);',
					'gl_Position.xy += offset;',
				'#elif BILLBOARD_TYPE == 1', // locked in y-axis
					'vec3 worldPos = (worldMatrix * vec4(vertexPosition.xyz, 1.0)).xyz;',
	
					'vec3 dirVec = cameraPosition - worldPos;',
					'dirVec.y = 0.0;',
					'dirVec = normalize(dirVec);',
					'vec3 upVec = vec3(0.0, 1.0, 0.0);',
					'vec3 leftVec = cross(upVec, dirVec) * offset.x;',
	
					'gl_Position = viewMatrix * vec4(worldPos + leftVec + upVec * offset.y, 1.0);',
				'#elif BILLBOARD_TYPE == 2', // facing dirVec (with up)
					'vec3 worldPos = (worldMatrix * vec4(vertexPosition.xyz, 1.0)).xyz;',
					'vec3 leftVec = cross(upVec, dirVec) * offset.x;',
					'gl_Position = viewMatrix * vec4(worldPos + leftVec + upVec * offset.y, 1.0);',
				'#endif',
	
				'gl_Position = projectionMatrix * gl_Position;',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D particleMap;',
			'uniform float alphakill;',
	
			'varying vec4 color;',
			'varying vec2 coords;',
	
			'void main(void)',
			'{',
				'vec4 col = color * texture2D(particleMap, coords);',
				'if (col.a <= alphakill) discard;',
				'gl_FragColor = col;',
			'}'
		].join('\n')
	};
