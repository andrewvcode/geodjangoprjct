

L.Control.GroupedLayers = L.Control.extend({
    options: {
        collapsed: !0,
        position: "topright",
        autoZIndex: !0,
        exclusiveGroups: [],
        groupCheckboxes: !1
    },
    initialize: function(a, b, c) {
        var d, e;
        L.Util.setOptions(this, c), this._layers = [], this._lastZIndex = 0, this._handlingClick = !1, this._groupList = [], this._domGroups = [];
        for (d in a) this._addLayer(a[d], d);
        for (d in b)
            for (e in b[d]) this._addLayer(b[d][e], e, d, !0)
    },
    onAdd: function(a) {
        return this._initLayout(), this._update(), a.on("layeradd", this._onLayerChange, this).on("layerremove", this._onLayerChange, this), this._container
    },
    onRemove: function(a) {
        a.off("layeradd", this._onLayerChange).off("layerremove", this._onLayerChange)
    },
    addBaseLayer: function(a, b) {
        return this._addLayer(a, b), this._update(), this
    },
    addOverlay: function(a, b, c) {
        return this._addLayer(a, b, c, !0), this._update(), this
    },
    removeLayer: function(a) {
        var b = L.Util.stamp(a),
            c = this._getLayer(b);
        return c && delete this.layers[this.layers.indexOf(c)], this._update(), this
    },
    _getLayer: function(a) {
        for (var b = 0; b < this._layers.length; b++)
            if (this._layers[b] && L.stamp(this._layers[b].layer) === a) return this._layers[b]
    },
    _initLayout: function() {
        var a = "leaflet-control-layers",
            b = this._container = L.DomUtil.create("div", a);
        b.setAttribute("aria-haspopup", !0), L.Browser.touch ? L.DomEvent.on(b, "click", L.DomEvent.stopPropagation) : (L.DomEvent.disableClickPropagation(b), L.DomEvent.on(b, "wheel", L.DomEvent.stopPropagation));
        var c = this._form = L.DomUtil.create("form", a + "-list");
        if (this.options.collapsed) {
            L.Browser.android || L.DomEvent.on(b, "mouseover", this._expand, this).on(b, "mouseout", this._collapse, this);
            var d = this._layersLink = L.DomUtil.create("a", a + "-toggle", b);
            d.href = "#", d.title = "Layers", L.Browser.touch ? L.DomEvent.on(d, "click", L.DomEvent.stop).on(d, "click", this._expand, this) : L.DomEvent.on(d, "focus", this._expand, this), this._map.on("click", this._collapse, this)
        } else this._expand();
        this._baseLayersList = L.DomUtil.create("div", a + "-base", c), this._separator = L.DomUtil.create("div", a + "-separator", c), this._overlaysList = L.DomUtil.create("div", a + "-overlays", c), b.appendChild(c)
    },
    _addLayer: function(a, b, c, d) {
        var e = (L.Util.stamp(a), {
            layer: a,
            name: b,
            overlay: d
        });
        this._layers.push(e), c = c || "";
        var f = this._indexOf(this._groupList, c); - 1 === f && (f = this._groupList.push(c) - 1);
        var g = -1 !== this._indexOf(this.options.exclusiveGroups, c);
        e.group = {
            name: c,
            id: f,
            exclusive: g
        }, this.options.autoZIndex && a.setZIndex && (this._lastZIndex++, a.setZIndex(this._lastZIndex))
    },
    _update: function() {
        if (this._container) {
            this._baseLayersList.innerHTML = "", this._overlaysList.innerHTML = "", this._domGroups.length = 0;
            for (var a, b, c = !1, d = !1, a = 0; a < this._layers.length; a++) b = this._layers[a], this._addItem(b), d = d || b.overlay, c = c || !b.overlay;
            this._separator.style.display = d && c ? "" : "none"
        }
    },
    _onLayerChange: function(a) {
        var b, c = this._getLayer(L.Util.stamp(a.layer));
        c && (this._handlingClick || this._update(), b = c.overlay ? "layeradd" === a.type ? "overlayadd" : "overlayremove" : "layeradd" === a.type ? "baselayerchange" : null, b && this._map.fire(b, c))
    },
    _createRadioElement: function(a, b) {
        var c = '<input type="radio" class="leaflet-control-layers-selector" name="' + a + '"';
        b && (c += ' checked="checked"'), c += "/>";
        var d = document.createElement("div");
        return d.innerHTML = c, d.firstChild
    },
    _addItem: function(a) {
        var b, c, d, e = document.createElement("label"),
            f = this._map.hasLayer(a.layer);
        a.overlay ? a.group.exclusive ? (d = "leaflet-exclusive-group-layer-" + a.group.id, b = this._createRadioElement(d, f)) : (b = document.createElement("input"), b.type = "checkbox", b.className = "leaflet-control-layers-selector", b.defaultChecked = f) : b = this._createRadioElement("leaflet-base-layers", f), b.layerId = L.Util.stamp(a.layer), b.groupID = a.group.id, L.DomEvent.on(b, "click", this._onInputClick, this);
        var g = document.createElement("span");
        if (g.innerHTML = " " + a.name, e.appendChild(b), e.appendChild(g), a.overlay) {
            c = this._overlaysList;
            var h = this._domGroups[a.group.id];
            if (!h) {
                h = document.createElement("div"), h.className = "leaflet-control-layers-group", h.id = "leaflet-control-layers-group-" + a.group.id;
                var i = document.createElement("label");
                if (i.className = "leaflet-control-layers-group-label", "" !== a.group.name && !a.group.exclusive && this.options.groupCheckboxes) {
                    var j = document.createElement("input");
                    j.type = "checkbox", j.className = "leaflet-control-layers-group-selector", j.groupID = a.group.id, j.legend = this, L.DomEvent.on(j, "click", this._onGroupInputClick, j), i.appendChild(j)
                }
                var k = document.createElement("span");
                k.className = "leaflet-control-layers-group-name", k.innerHTML = a.group.name, i.appendChild(k), h.appendChild(i), c.appendChild(h), this._domGroups[a.group.id] = h
            }
            c = h
        } else c = this._baseLayersList;
        return c.appendChild(e), e
    },
    _onGroupInputClick: function() {
        var a, b, c, d = this.legend;
        d._handlingClick = !0;
        var e = d._form.getElementsByTagName("input"),
            f = e.length;
        for (a = 0; f > a; a++) b = e[a], b.groupID === this.groupID && "leaflet-control-layers-selector" === b.className && (b.checked = this.checked, c = d._getLayer(b.layerId), b.checked && !d._map.hasLayer(c.layer) ? d._map.addLayer(c.layer) : !b.checked && d._map.hasLayer(c.layer) && d._map.removeLayer(c.layer));
        d._handlingClick = !1
    },
    _onInputClick: function() {
        var a, b, c, d = this._form.getElementsByTagName("input"),
            e = d.length;
        for (this._handlingClick = !0, a = 0; e > a; a++) b = d[a], "leaflet-control-layers-selector" === b.className && (c = this._getLayer(b.layerId), b.checked && !this._map.hasLayer(c.layer) ? this._map.addLayer(c.layer) : !b.checked && this._map.hasLayer(c.layer) && this._map.removeLayer(c.layer));
        this._handlingClick = !1
    },
    _expand: function() {
        L.DomUtil.addClass(this._container, "leaflet-control-layers-expanded");
        var a = this._map._size.y - 4 * this._container.offsetTop;
        a < this._form.clientHeight && (L.DomUtil.addClass(this._form, "leaflet-control-layers-scrollbar"), this._form.style.height = a + "px")
    },
    _collapse: function() {
        this._container.className = this._container.className.replace(" leaflet-control-layers-expanded", "")
    },
    _indexOf: function(a, b) {
        for (var c = 0, d = a.length; d > c; c++)
            if (a[c] === b) return c;
        return -1
    }
}), L.control.groupedLayers = function(a, b, c) {
    return new L.Control.GroupedLayers(a, b, c)
};
