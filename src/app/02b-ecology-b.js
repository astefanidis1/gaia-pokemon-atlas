          name:feature.name, note:feature.note || '', color:feature.color || (kind==='habitats'?'#8ec99a':'#8de9f5'),
          seasonal:feature.seasonal || '', seasonStatus:seasonal.status,
          seasonNote:seasonal.note || '', seasonMultiplier:seasonal.multiplier,
          opacity: state.ecology.seasonal ? baseOpacity * seasonal.multiplier : baseOpacity,
          species:JSON.stringify(feature.species || []), featureKind:kind === 'habitats' ? 'Habitat system' : 'Ecological corridor'
        },
        geometry: kind === 'habitats'
          ? {type:'Polygon',coordinates:[[...(feature.polygon || [])]]}
          : {type:'LineString',coordinates:feature.coordinates || []}
      };
    }));
  }
  function ecologyRegions() {
    return state.ecology.region === 'all' ? regions : regions.filter(region => region.id === state.ecology.region);
  }
  function renderEcologyLayers() {
    if (!state.mapReady) return;
    if (state.realm !== 'Earth') {
      state.map?.getSource?.('gaia-region-habitats')?.setData(emptyFeatureCollection());
      state.map?.getSource?.('gaia-region-corridors')?.setData(emptyFeatureCollection());
      const label=$('#ecologySeasonLabel'); if(label)label.textContent='Ecology layers available on Earth';
      return;
    }
    const zoom = state.map?.getZoom?.() ?? 1.5;
    const selectedRegions = ecologyRegions();
    const habitats = state.ecology.habitats && zoom >= 1.45 ? ecologyFeatures('habitats',selectedRegions) : [];
    const corridors = state.ecology.corridors && zoom >= 2.15 ? ecologyFeatures('corridors',selectedRegions) : [];
    state.map?.getSource?.('gaia-region-habitats')?.setData({type:'FeatureCollection',features:habitats});
    state.map?.getSource?.('gaia-region-corridors')?.setData({type:'FeatureCollection',features:corridors});
    if (state.map?.getLayer?.('gaia-region-habitat-fill')) {
      state.map.setPaintProperty('gaia-region-habitat-fill','fill-opacity',['coalesce',['get','opacity'],.06]);
      state.map.setPaintProperty('gaia-region-habitat-line','line-opacity',['*',['coalesce',['get','seasonMultiplier'],1],.72]);
      state.map.setPaintProperty('gaia-region-corridor-line','line-opacity',['coalesce',['get','opacity'],.5]);
    }
    const season = currentSeasonId();
    const visibleSystems = habitats.length + corridors.length;
    $('#ecologySeasonLabel').textContent = `${season[0].toUpperCase()+season.slice(1)} · ${visibleSystems} systems visible`;
  }
  function ensureEcologyMapInteractions() {
    if (!state.map || state.map.__gaiaEcologyBound || !state.map.getLayer?.('gaia-region-habitat-fill')) return;
    state.map.__gaiaEcologyBound = true;
    const layers=['gaia-region-habitat-fill','gaia-region-corridor-line'];
    layers.forEach(layer => {
      state.map.on('mouseenter',layer,()=>{state.map.getCanvas().style.cursor='pointer';});
      state.map.on('mouseleave',layer,()=>{state.map.getCanvas().style.cursor='';});
      state.map.on('click',layer,event=>{
        event.preventDefault();
        const feature=event.features?.[0];
        if(feature) openEcologyInspector(feature.properties);
      });
    });
    state.map.on('zoomend',renderEcologyLayers);
  }
  function speciesButtons(slugs) {
    return slugs.map(slug=>findBySlug(slug)).filter(Boolean).map(item=>`<button data-ecology-species="${escapeHTML(item.slug)}"><img src="${escapeHTML(item.image)}" data-species-slug="${escapeHTML(item.slug)}" alt=""><span>${escapeHTML(item.name)}</span></button>`).join('');
  }
  function relationCards(regionId, speciesSlugs=[]) {
    const matches=(relationshipsByRegion.get(regionId)||[]).filter(relation=>!speciesSlugs.length || relation.species.some(slug=>speciesSlugs.includes(slug)));
