// Estado global de la aplicación
const appState = {
    currentRole: 'gerente',
    activeSection: 'dashboard',

    data: {
        products: [
            { id: 1, name: 'Polo Básico Blanco', cantidad: 50, etapa: 'tela', categoria: 'Polos', fechaInicio: '2024-11-10' },
            { id: 2, name: 'Jean Slim Fit', cantidad: 30, etapa: 'corte', categoria: 'Jeans', fechaInicio: '2024-11-08' },
            { id: 3, name: 'Hoodie Logo', cantidad: 20, etapa: 'estampado', categoria: 'Buzos', fechaInicio: '2024-11-05' },
            { id: 4, name: 'Camisa Formal', cantidad: 15, etapa: 'costura', categoria: 'Camisas', fechaInicio: '2024-11-01' },
        ],
        almacen: [
            { id: 1, producto: 'Polo Básico Negro', stock: 120, ingresos: 150, ventas: 30, categoria: 'Polos', precioCompra: 15, precioVenta: 35 },
            { id: 2, producto: 'Jean Regular', stock: 80, ingresos: 100, ventas: 20, categoria: 'Jeans', precioCompra: 35, precioVenta: 80 },
            { id: 3, producto: 'Vestido Casual', stock: 45, ingresos: 60, ventas: 15, categoria: 'Vestidos', precioCompra: 25, precioVenta: 60 },
        ],
        tiendas: [
            { id: 1, nombre: 'Tienda Centro', stock: 250, ventas: 89, salidas: 95 },
            { id: 2, nombre: 'Tienda Mall', stock: 180, ventas: 134, salidas: 140 },
            { id: 3, nombre: 'Tienda Outlet', stock: 320, ventas: 67, salidas: 70 },
        ],
        etapas: [
            { id: 'tela', name: 'TELA', icon: '🧵', color: 'bg-blue-500' },
            { id: 'corte', name: 'CORTE', icon: '✂️', color: 'bg-purple-500' },
            { id: 'estampado', name: 'ESTAMPADO/BORDADO', icon: '🎨', color: 'bg-pink-500' },
            { id: 'costura', name: 'COSTURA', icon: '🪡', color: 'bg-orange-500' },
            { id: 'almacen', name: 'ALMACÉN', icon: '📦', color: 'bg-green-500' },
        ]
    },

    rolePermissions: {
        gerente: ['dashboard', 'produccion', 'almacen', 'tiendas', 'reportes', 'usuarios'],
        produccion: ['produccion', 'almacen'],
        asistente: ['almacen', 'tiendas', 'reportes']
    },

    rolInfo: {
        gerente: { name: 'Douglas McGee', icon: '👔' },
        produccion: { name: 'Juan Pérez', icon: '🏭' },
        asistente: { name: 'María López', icon: '📋' }
    },

    sections: ['dashboard', 'produccion', 'almacen', 'tiendas', 'reportes', 'usuarios'],

    // Métodos
    getProductosPorEtapa(etapaId) {
        return this.data.products.filter(p => p.etapa === etapaId);
    },

    moverEtapa(productId) {
        const product = this.data.products.find(p => p.id === productId);
        if (!product) return;

        const currentIndex = this.data.etapas.findIndex(e => e.id === product.etapa);
        if (currentIndex < this.data.etapas.length - 1) {
            const newEtapa = this.data.etapas[currentIndex + 1].id;

            // Si llega a almacén, agregar al inventario
            if (newEtapa === 'almacen') {
                const newId = Math.max(...this.data.almacen.map(a => a.id), 0) + 1;
                this.data.almacen.push({
                    id: newId,
                    producto: product.name,
                    stock: product.cantidad,
                    ingresos: product.cantidad,
                    ventas: 0,
                    categoria: product.categoria,
                    precioCompra: 0,
                    precioVenta: 0
                });

                // Mostrar notificación
                showNotification(`✅ ${product.name} movido a Almacén`, 'success');
            } else {
                showNotification(`✅ ${product.name} movido a ${this.data.etapas.find(e => e.id === newEtapa).name}`, 'success');
            }

            product.etapa = newEtapa;
            this.renderProduccion();
            this.renderDashboard();
        }
    },

    // CRUD Operations
    editingProductId: null,
    // Almacén: estado y utilidades
    editingAlmacenId: null,
    almacenFilter: '',
    almacenLowStockOnly: false,

    openAddProductModal() {
        this.editingProductId = null;
        document.getElementById('productModalTitle').textContent = 'Nuevo Producto';
        document.getElementById('productForm').reset();

        // Establecer fecha de hoy
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('productFecha').value = today;

        document.getElementById('productModal').classList.add('active');
    },

    openEditProductModal(productId) {
        const product = this.data.products.find(p => p.id === productId);
        if (!product) return;

        this.editingProductId = productId;
        document.getElementById('productModalTitle').textContent = 'Editar Producto';
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategoria').value = product.categoria;
        document.getElementById('productCantidad').value = product.cantidad;
        document.getElementById('productEtapa').value = product.etapa;
        document.getElementById('productFecha').value = product.fechaInicio;

        document.getElementById('productModal').classList.add('active');
    },

    closeProductModal() {
        this.editingProductId = null;
        document.getElementById('productModal').classList.remove('active');
        document.getElementById('productForm').reset();
    },

    saveProduct(event) {
        event.preventDefault();

        const name = document.getElementById('productName').value.trim();
        const categoria = document.getElementById('productCategoria').value.trim();
        const cantidad = parseInt(document.getElementById('productCantidad').value);
        const etapa = document.getElementById('productEtapa').value;
        const fechaInicio = document.getElementById('productFecha').value;

        if (!name || !categoria || !cantidad || !etapa || !fechaInicio) {
            showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        if (this.editingProductId) {
            // Actualizar producto existente
            const product = this.data.products.find(p => p.id === this.editingProductId);
            product.name = name;
            product.categoria = categoria;
            product.cantidad = cantidad;
            product.etapa = etapa;
            product.fechaInicio = fechaInicio;

            showNotification(`✏️ ${name} actualizado correctamente`, 'success');
        } else {
            // Crear nuevo producto
            const newId = Math.max(...this.data.products.map(p => p.id), 0) + 1;
            this.data.products.push({
                id: newId,
                name,
                cantidad,
                etapa,
                categoria,
                fechaInicio
            });

            showNotification(`✅ ${name} agregado correctamente`, 'success');
        }

        this.closeProductModal();
        this.renderProduccion();
        this.renderDashboard();
        this.renderMenu();
    },

    deleteProductSetup(productId) {
        const product = this.data.products.find(p => p.id === productId);
        if (!product) return;

        this.productToDelete = productId;
        document.getElementById('deleteModal').classList.add('active');
    },

    closeDeleteModal() {
        this.productToDelete = null;
        document.getElementById('deleteModal').classList.remove('active');
    },

    confirmDelete() {
        if (!this.productToDelete) return;

        const product = this.data.products.find(p => p.id === this.productToDelete);
        const productName = product.name;

        this.data.products = this.data.products.filter(p => p.id !== this.productToDelete);

        this.closeDeleteModal();
        showNotification(`🗑️ ${productName} eliminado correctamente`, 'success');

        this.renderProduccion();
        this.renderDashboard();
        this.renderMenu();
    },

    openBulkUploadModal() {
        showNotification('Funcionalidad de importación en desarrollo', 'info');
    },

    /* --------------------- GESTIÓN DE ALMACÉN --------------------- */
    openAddAlmacenModal() {
        this.editingAlmacenId = null;
        document.getElementById('warehouseModalTitle').textContent = 'Nuevo Ítem de Almacén';
        const form = document.getElementById('warehouseForm');
        if (form) form.reset();
        document.getElementById('warehouseModal').classList.add('active');
    },

    openEditAlmacenModal(itemId) {
        const item = this.data.almacen.find(a => a.id === itemId);
        if (!item) return;
        this.editingAlmacenId = itemId;
        document.getElementById('warehouseModalTitle').textContent = 'Editar Ítem de Almacén';
        document.getElementById('almProducto').value = item.producto;
        document.getElementById('almCategoria').value = item.categoria;
        document.getElementById('almStock').value = item.stock;
        document.getElementById('almIngresos').value = item.ingresos;
        document.getElementById('almVentas').value = item.ventas;
        document.getElementById('almPrecioCompra').value = item.precioCompra;
        document.getElementById('almPrecioVenta').value = item.precioVenta;

        document.getElementById('warehouseModal').classList.add('active');
    },

    closeAlmacenModal() {
        this.editingAlmacenId = null;
        document.getElementById('warehouseModal').classList.remove('active');
        const form = document.getElementById('warehouseForm');
        if (form) form.reset();
    },

    saveAlmacenItem(event) {
        event.preventDefault();
        const producto = document.getElementById('almProducto').value.trim();
        const categoria = document.getElementById('almCategoria').value.trim();
        const stock = parseInt(document.getElementById('almStock').value) || 0;
        const ingresos = parseInt(document.getElementById('almIngresos').value) || 0;
        const ventas = parseInt(document.getElementById('almVentas').value) || 0;
        const precioCompra = parseFloat(document.getElementById('almPrecioCompra').value) || 0;
        const precioVenta = parseFloat(document.getElementById('almPrecioVenta').value) || 0;

        if (!producto || !categoria) {
            showNotification('Completa producto y categoría', 'error');
            return;
        }

        if (this.editingAlmacenId) {
            const item = this.data.almacen.find(a => a.id === this.editingAlmacenId);
            if (!item) return;
            item.producto = producto;
            item.categoria = categoria;
            item.stock = stock;
            item.ingresos = ingresos;
            item.ventas = ventas;
            item.precioCompra = precioCompra;
            item.precioVenta = precioVenta;
            showNotification(`✏️ ${producto} actualizado`, 'success');
        } else {
            const newId = Math.max(...this.data.almacen.map(a => a.id), 0) + 1;
            this.data.almacen.push({ id: newId, producto, categoria, stock, ingresos, ventas, precioCompra, precioVenta });
            showNotification(`✅ ${producto} agregado al almacén`, 'success');
        }

        this.closeAlmacenModal();
        this.renderAlmacen();
        this.renderDashboard();
        this.renderMenu();
    },

    deleteAlmacenSetup(itemId) {
        const item = this.data.almacen.find(a => a.id === itemId);
        if (!item) return;
        this.almacenToDelete = itemId;
        document.getElementById('deleteModal').classList.add('active');
    },

    confirmDeleteAlmacen() {
        if (!this.almacenToDelete) return;
        const item = this.data.almacen.find(a => a.id === this.almacenToDelete);
        if (!item) return;
        const name = item.producto;
        this.data.almacen = this.data.almacen.filter(a => a.id !== this.almacenToDelete);
        this.almacenToDelete = null;
        document.getElementById('deleteModal').classList.remove('active');
        showNotification(`🗑️ ${name} eliminado del almacén`, 'success');
        this.renderAlmacen();
        this.renderDashboard();
    },

    adjustStock(itemId, delta) {
        const item = this.data.almacen.find(a => a.id === itemId);
        if (!item) return;
        const previous = item.stock;
        item.stock = Math.max(0, item.stock + delta);
        if (delta > 0) item.ingresos += delta;
        if (delta < 0) item.ventas += Math.abs(delta);
        showNotification(`📦 ${item.producto}: ${previous} → ${item.stock}`, 'info');
        this.renderAlmacen();
        this.renderDashboard();
    },

    exportAlmacenCSV() {
        if (!this.data.almacen || this.data.almacen.length === 0) {
            showNotification('No hay datos para exportar', 'info');
            return;
        }
        const rows = [
            ['id', 'producto', 'categoria', 'stock', 'ingresos', 'ventas', 'precioCompra', 'precioVenta']
        ];
        this.data.almacen.forEach(it => rows.push([it.id, it.producto, it.categoria, it.stock, it.ingresos, it.ventas, it.precioCompra, it.precioVenta]));
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `almacen_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showNotification('Exportado CSV correctamente', 'success');
    },

    importAlmacenFromJSON(text) {
        try {
            const arr = JSON.parse(text);
            if (!Array.isArray(arr)) throw new Error('JSON debe ser un arreglo');
            const maxId = Math.max(...this.data.almacen.map(a => a.id), 0);
            let nextId = maxId + 1;
            arr.forEach(obj => {
                const item = {
                    id: nextId++,
                    producto: obj.producto || obj.name || 'Item',
                    categoria: obj.categoria || obj.category || 'Sin categoría',
                    stock: parseInt(obj.stock) || 0,
                    ingresos: parseInt(obj.ingresos) || 0,
                    ventas: parseInt(obj.ventas) || 0,
                    precioCompra: parseFloat(obj.precioCompra) || 0,
                    precioVenta: parseFloat(obj.precioVenta) || 0
                };
                this.data.almacen.push(item);
            });
            showNotification(`✅ Importados ${arr.length} ítems correctamente`, 'success');
            this.renderAlmacen();
            this.renderDashboard();
        } catch (err) {
            console.error(err);
            showNotification('Error al importar JSON: ' + err.message, 'error');
        }
    },

    /* --------------------- FIN GESTIÓN DE ALMACÉN --------------------- */

    changeRole(newRole) {
        this.currentRole = newRole;
        this.activeSection = 'dashboard';

        const info = this.rolInfo[newRole] || { name: newRole || 'Usuario', icon: '👤' };
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        const userIconEl = document.getElementById('userIcon');
        if (userNameEl) userNameEl.textContent = info.name;
        if (userRoleEl) userRoleEl.textContent = newRole;
        if (userIconEl) userIconEl.textContent = info.icon;

        if (!this.rolePermissions[newRole]) {
            console.warn('Rol no reconocido:', newRole);
            this.rolePermissions[newRole] = [];
        }

        this.renderMenu();
        this.switchSection('dashboard');
    },

    switchSection(section) {
        this.activeSection = section;

        this.sections.forEach(s => {
            const el = document.getElementById(s);
            if (el) {
                if (s !== section) {
                    el.classList.add('hidden');
                } else {
                    el.classList.remove('hidden');
                }
            }
        });

        this.renderMenu();
        this.updatePageTitle();
        this.renderContent();
    },

    updatePageTitle() {
        const titles = {
            dashboard: '📊 Dashboard General',
            produccion: '🏭 Control de Producción',
            almacen: '📦 Gestión de Almacén',
            tiendas: '🏪 Control de Tiendas',
            reportes: '📈 Reportes y Análisis',
            usuarios: '👥 Gestión de Usuarios'
        };
        document.getElementById('pageTitle').textContent = titles[this.activeSection];
    },

    renderMenu() {
        const menu = document.getElementById('menu');
        if (!menu) {
            console.error('❌ Elemento #menu no encontrado');
            return;
        }
        
        menu.innerHTML = '';

        const permissions = this.rolePermissions[this.currentRole];
        if (!permissions) {
            console.warn('⚠️ No hay permisos para el rol:', this.currentRole);
            return;
        }

        const menuItems = [
            { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: null },
            { id: 'produccion', label: 'Producción', icon: '🏭', badge: this.data.products.length },
            { id: 'almacen', label: 'Almacén', icon: '📦', badge: this.data.almacen.length },
            { id: 'tiendas', label: 'Tiendas', icon: '🏪', badge: null },
            { id: 'reportes', label: 'Reportes', icon: '📈', badge: null },
            { id: 'usuarios', label: 'Usuarios', icon: '👥', badge: null },
        ];

        menuItems.forEach(item => {
            if (permissions.includes(item.id)) {
                const btn = document.createElement('button');
                btn.className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${this.activeSection === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                    }`;
                btn.onclick = () => this.switchSection(item.id);

                btn.innerHTML = `
                    <span class="text-xl">${item.icon}</span>
                    <span class="flex-1 text-left">${item.label}</span>
                    ${item.badge ? `<span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">${item.badge}</span>` : ''}
                `;
                menu.appendChild(btn);
            }
        });
    },

    renderContent() {
        if (this.activeSection === 'dashboard') this.renderDashboard();
        if (this.activeSection === 'produccion') this.renderProduccion();
        if (this.activeSection === 'almacen') this.renderAlmacen();
        if (this.activeSection === 'tiendas') this.renderTiendas();
        if (this.activeSection === 'reportes') this.renderReportes();
    },

    renderDashboard() {
        document.getElementById('statProduction').textContent = this.data.products.length;
        document.getElementById('statWarehouse').textContent = this.data.almacen.reduce((sum, item) => sum + item.stock, 0);
        document.getElementById('statStores').textContent = this.data.tiendas.length;
        document.getElementById('statSales').textContent = this.data.tiendas.reduce((sum, t) => sum + t.ventas, 0);

        const flow = document.getElementById('productionFlow');
        flow.innerHTML = this.data.etapas.map(etapa => {
            const count = this.data.products.filter(p => p.etapa === etapa.id).length;
            return `
                <div class="${etapa.color} text-white rounded-lg p-4 text-center">
                    <div class="text-3xl mb-2">${etapa.icon}</div>
                    <div class="font-bold text-sm">${etapa.name}</div>
                    <div class="text-2xl font-bold mt-2">${count}</div>
                    <div class="text-xs opacity-90">productos</div>
                </div>
            `;
        }).join('');
    },

    renderProduccion() {
        const pipeline = document.getElementById('pipeline');
        pipeline.innerHTML = this.data.etapas.map((etapa, index) => {
            const count = this.data.products.filter(p => p.etapa === etapa.id).length;
            return `
                <div class="flex-1">
                    <div class="${etapa.color} text-white rounded-lg p-3 text-center shadow-md">
                        <div class="text-2xl mb-1">${etapa.icon}</div>
                        <div class="font-bold text-xs">${etapa.name}</div>
                        <div class="text-xl font-bold mt-1">${count}</div>
                    </div>
                </div>
                ${index < this.data.etapas.length - 1 ? '<div class="text-gray-400 text-2xl">→</div>' : ''}
            `;
        }).join('');

        const stages = document.getElementById('productionStages');
        stages.innerHTML = this.data.etapas.map(etapa => {
            const productsInStage = this.data.products.filter(p => p.etapa === etapa.id);
            if (productsInStage.length === 0) return '';

            return `
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="${etapa.color} text-white w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-md">
                            ${etapa.icon}
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-800">${etapa.name}</h3>
                            <p class="text-sm text-gray-500">${productsInStage.length} producto${productsInStage.length !== 1 ? 's' : ''} en esta etapa</p>
                        </div>
                    </div>

                    <div class="space-y-3">
                        ${productsInStage.map(product => {
                const days = Math.floor((new Date() - new Date(product.fechaInicio)) / (1000 * 60 * 60 * 24));
                return `
                                <div class="border rounded-lg p-4 hover:shadow-md transition-shadow product-card">
                                    <div class="flex items-center justify-between gap-4">
                                        <div class="flex-1">
                                            <div class="flex items-center gap-3">
                                                <h4 class="font-bold text-gray-800">${product.name}</h4>
                                                <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">${product.categoria}</span>
                                            </div>
                                            <div class="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                <span>📦 Cantidad: <strong>${product.cantidad}</strong></span>
                                                <span>📅 Inicio: ${product.fechaInicio}</span>
                                                <span>🕐 ${days} días</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-col gap-2">
                                            ${etapa.id !== 'almacen' ? `
                                                <button onclick="appState.moverEtapa(${product.id})" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-semibold text-sm whitespace-nowrap">
                                                    Siguiente →
                                                </button>
                                            ` : `
                                                <div class="flex items-center gap-2 text-green-600 px-3 py-2">
                                                    <span>✅</span>
                                                    <span class="font-semibold text-sm">Completado</span>
                                                </div>
                                            `}
                                            <button onclick="appState.openEditProductModal(${product.id})" class="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-all shadow-md font-semibold text-sm whitespace-nowrap">
                                                ✏️ Editar
                                            </button>
                                            <button onclick="appState.deleteProductSetup(${product.id})" class="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all shadow-md font-semibold text-sm whitespace-nowrap">
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderAlmacen() {
        const table = document.getElementById('warehouseTable');

        let items = this.data.almacen.slice();
        const q = this.almacenFilter && this.almacenFilter.toLowerCase();
        if (q) {
            items = items.filter(it => (it.producto + ' ' + it.categoria).toLowerCase().includes(q));
        }
        if (this.almacenLowStockOnly) {
            items = items.filter(it => it.stock < 50);
        }

        if (!table) return;

        if (items.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="8" class="p-6 text-center text-gray-500">No se encontraron ítems.</td>
                </tr>`;
            return;
        }

        table.innerHTML = items.map(item => `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="font-semibold text-gray-800">${item.producto}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                        ${item.categoria}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="font-bold ${item.stock < 50 ? 'text-red-600' : 'text-green-600'}">
                        ${item.stock}
                    </span>
                </td>
                <td class="px-6 py-4 text-center text-blue-600 font-semibold">+${item.ingresos}</td>
                <td class="px-6 py-4 text-center text-orange-600 font-semibold">-${item.ventas}</td>
                <td class="px-6 py-4 text-center">
                    <span class="font-bold text-gray-800">${item.stock}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="text-xs">
                        <div class="text-gray-600">C: S/${item.precioCompra}</div>
                        <div class="text-green-600 font-semibold">V: S/${item.precioVenta}</div>
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="appState.openEditAlmacenModal(${item.id})" class="text-orange-600 hover:text-orange-800 font-semibold text-sm">✏️</button>
                        <button onclick="appState.adjustStock(${item.id}, 1)" class="text-green-600 hover:text-green-800 font-semibold text-sm">+1</button>
                        <button onclick="appState.adjustStock(${item.id}, -1)" class="text-red-600 hover:text-red-800 font-semibold text-sm">-1</button>
                        <button onclick="appState.deleteAlmacenSetup(${item.id})" class="text-gray-600 hover:text-gray-900 font-semibold text-sm">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderTiendas() {
        const grid = document.getElementById('storesGrid');
        grid.innerHTML = this.data.tiendas.map(tienda => `
            <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl shadow-md">
                        🏪
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800">${tienda.nombre}</h3>
                        <p class="text-xs text-gray-500">ID: ${tienda.id}</p>
                    </div>
                </div>

                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span class="text-sm text-gray-600">Stock Actual</span>
                        <span class="font-bold text-blue-600">${tienda.stock}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span class="text-sm text-gray-600">Ventas</span>
                        <span class="font-bold text-green-600">${tienda.ventas}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span class="text-sm text-gray-600">Salidas</span>
                        <span class="font-bold text-orange-600">${tienda.salidas}</span>
                    </div>
                </div>

                <button onclick="alert('Funcionalidad en desarrollo')" class="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                    Gestionar Productos
                </button>
            </div>
        `).join('');
    },

    renderReportes() {
        const productionReport = document.getElementById('productionReport');
        productionReport.innerHTML = this.data.etapas.map(etapa => {
            const count = this.data.products.filter(p => p.etapa === etapa.id).length;
            return `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span class="flex items-center gap-2">
                        <span>${etapa.icon}</span>
                        <span class="text-sm font-semibold">${etapa.name}</span>
                    </span>
                    <span class="font-bold">${count} producto${count !== 1 ? 's' : ''}</span>
                </div>
            `;
        }).join('');

        const salesReport = document.getElementById('salesReport');
        salesReport.innerHTML = this.data.tiendas.map(tienda => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span class="text-sm font-semibold">${tienda.nombre}</span>
                <span class="font-bold text-green-600">${tienda.ventas} venta${tienda.ventas !== 1 ? 's' : ''}</span>
            </div>
        `).join('');
    }
};

// Funciones auxiliares
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando aplicación Fashion Control...');
    
    const roleSelector = document.getElementById('roleSelector');
    const menu = document.getElementById('menu');
    const dashboard = document.getElementById('dashboard');
    
    console.log('✓ roleSelector:', roleSelector ? 'OK' : 'NO ENCONTRADO');
    console.log('✓ menu:', menu ? 'OK' : 'NO ENCONTRADO');
    console.log('✓ dashboard:', dashboard ? 'OK' : 'NO ENCONTRADO');
    
    if (roleSelector) {
        roleSelector.addEventListener('change', (e) => {
            console.log('👤 Cambiando rol a:', e.target.value);
            appState.changeRole(e.target.value);
        });
        roleSelector.value = appState.currentRole;
        console.log('✓ Rol inicial:', appState.currentRole);
    }

    console.log('📋 Renderizando menú...');
    appState.renderMenu();
    
    console.log('📊 Renderizando dashboard...');
    appState.renderDashboard();
    
    console.log('🔀 Cambiando a sección dashboard...');
    appState.switchSection('dashboard');

    const almacenSearch = document.getElementById('almacenSearch');
    const almacenLowStock = document.getElementById('almacenLowStock');
    const importAlmacenInput = document.getElementById('importAlmacenInput');
    
    if (almacenSearch) {
        almacenSearch.addEventListener('input', (e) => {
            appState.almacenFilter = e.target.value;
            appState.renderAlmacen();
        });
    }
    
    if (almacenLowStock) {
        almacenLowStock.addEventListener('change', (e) => {
            appState.almacenLowStockOnly = e.target.checked;
            appState.renderAlmacen();
        });
    }
    
    if (importAlmacenInput) {
        importAlmacenInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    appState.importAlmacenFromJSON(event.target.result);
                };
                reader.readAsText(file);
            }
        });
    }
    
    console.log('✅ Aplicación iniciada correctamente');
});