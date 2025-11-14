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

    addNewProduction() {
        alert('Funcionalidad de agregar nueva producción en desarrollo');
    },

    changeRole(newRole) {
        this.currentRole = newRole;
        this.activeSection = 'dashboard';
        
        const info = this.rolInfo[newRole];
        document.getElementById('userName').textContent = info.name;
        document.getElementById('userRole').textContent = newRole;
        document.getElementById('userIcon').textContent = info.icon;
        
        this.renderMenu();
        this.switchSection('dashboard');
    },

    switchSection(section) {
        this.activeSection = section;
        
        this.sections.forEach(s => {
            const el = document.getElementById(s);
            if (el) {
                el.classList.toggle('hidden', s !== section);
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
        menu.innerHTML = '';
        
        const permissions = this.rolePermissions[this.currentRole];
        
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
                btn.className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    this.activeSection === item.id
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
                                    <div class="flex items-center justify-between">
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
                                        <button onclick="appState.moverEtapa(${product.id})" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-semibold">
                                            Siguiente →
                                        </button>
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
        table.innerHTML = this.data.almacen.map(item => `
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
                    <button onclick="alert('Funcionalidad en desarrollo')" class="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                        Editar
                    </button>
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
    const roleSelector = document.getElementById('roleSelector');
    
    roleSelector.addEventListener('change', (e) => {
        appState.changeRole(e.target.value);
    });

    // Inicializar
    appState.renderMenu();
    appState.renderDashboard();
});