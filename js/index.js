// Initial Default Catalog
        const defaultProducts = [
            {
                id: 1,
                name: "Boné Temático Orgulho Autista - Inclusão",
                price: 59.90,
                category: "Vestuário",
                image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
                description: "Boné feminino rosa suave e lavanda com bordado delicado de peças do quebra-cabeça do autismo e ajuste super confortável."
            },
            {
                id: 2,
                name: "Camiseta Baby Look 'Compreender & Acolher'",
                price: 64.90,
                category: "Vestuário",
                image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                description: "Tecido 100% algodão ultra macio sem etiquetas na gola, prevenindo hipersensibilidade tátil."
            },
            {
                id: 3,
                name: "Cordão de Girassol com Porta-Crachá Rosa",
                price: 29.90,
                category: "Acessórios",
                image: "https://images.unsplash.com/photo-1611591475285-a30ba4587383?auto=format&fit=crop&w=800&q=80",
                description: "Cordão acetinado macio para identificação de deficiência oculta com trava de segurança rápida."
            },
            {
                id: 4,
                name: "Pulseira Delicada Miçangas Quebra-Cabeça Pastel",
                price: 34.90,
                category: "Acessórios",
                image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
                description: "Pulseira artesanal regulável com miçangas em tons rosa, azul e lilás com pingente folheado."
            },
            {
                id: 5,
                name: "Kit Mordedores Sensoriais Flor em Silicone",
                price: 49.90,
                category: "Brinquedos Sensoriais",
                image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
                description: "Silicone atóxico de grau alimentar. Cores pastéis relaxantes para momentos de autorregulação."
            },
            {
                id: 6,
                name: "Caderno Planner da Mãe Atípica",
                price: 52.00,
                category: "Papelaria",
                image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
                description: "Planner completo para organização de terapias, consultas e diário de desenvolvimento do seu filho."
            }
        ];

        // Global State variables
        let products = JSON.parse(localStorage.getItem('vanilla_inc_products')) || defaultProducts;
        let cart = JSON.parse(localStorage.getItem('vanilla_inc_cart')) || [];
        let currentCategory = 'all';
        let searchQuery = '';
        let uploadedBase64Image = '';
        let isAdminLoggedIn = localStorage.getItem('vanilla_inc_admin') === 'true';

        // Window Init
        window.onload = function() {
            renderProducts();
            updateCartBadge();
        };

        // Switch Store vs Admin View
        function switchView(view) {
            const storeView = document.getElementById('storeView');
            const adminView = document.getElementById('adminView');

            if (view === 'store') {
                storeView.classList.remove('hidden');
                adminView.classList.add('hidden');
            } else if (view === 'admin') {
                if (!isAdminLoggedIn) {
                    openAdminAuth();
                    return;
                }
                storeView.classList.add('hidden');
                adminView.classList.remove('hidden');
                renderAdminDashboard();
            }
        }

        // Render Store Products Grid
        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = '';

            const filtered = products.filter(p => {
                const matchCat = currentCategory === 'all' || p.category === currentCategory;
                const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    p.description.toLowerCase().includes(searchQuery.toLowerCase());
                return matchCat && matchSearch;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
                        <p style="font-size: 1.1rem;">Nenhum produto encontrado nesta categoria.</p>
                    </div>
                `;
                return;
            }

            filtered.forEach(p => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="card-img-wrap">
                        <img src="${p.image || 'https://placehold.co/600x400/F472B6/ffffff?text=Produto'}" alt="${p.name}" onerror="this.src='https://placehold.co/600x400/F472B6/ffffff?text=Inclusao'">
                        <span class="card-badge">${p.category}</span>
                    </div>
                    <div class="card-body">
                        <div>
                            <h3 class="card-title">${p.name}</h3>
                            <p class="card-desc" style="margin-top: 6px;">${p.description}</p>
                        </div>
                        <div class="card-footer">
                            <div>
                                <span class="card-price-label">Preço</span>
                                <div class="card-price">R$ ${Number(p.price).toFixed(2)}</div>
                            </div>
                            <div class="card-actions">
                                <button onclick="addToCart(${p.id})" class="icon-btn" title="Adicionar ao Carrinho">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                </button>
                                <button onclick="buyNowWhatsApp(${p.id})" class="btn btn-whatsapp" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">
                                    Comprar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // Category Filter Function
        function setCategoryFilter(cat) {
            currentCategory = cat;
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            const btn = document.getElementById(`cat-${cat}`);
            if (btn) btn.classList.add('active');
            renderProducts();
        }

        // Search Input Handler
        function handleSearch() {
            searchQuery = document.getElementById('searchInput').value;
            renderProducts();
        }

        // Cart Operations
        function addToCart(id) {
            const prod = products.find(p => p.id === id);
            if (!prod) return;

            const existing = cart.find(item => item.id === id);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ ...prod, qty: 1 });
            }

            saveCart();
            updateCartBadge();
            toggleCart(true);
        }

        function updateCartQty(id, delta) {
            const item = cart.find(i => i.id === id);
            if (item) {
                item.qty += delta;
                if (item.qty <= 0) {
                    cart = cart.filter(i => i.id !== id);
                }
                saveCart();
                updateCartBadge();
                renderCartDrawer();
            }
        }

        function saveCart() {
            localStorage.setItem('vanilla_inc_cart', JSON.stringify(cart));
        }

        function updateCartBadge() {
            const badge = document.getElementById('cartBadge');
            const count = cart.reduce((sum, item) => sum + item.qty, 0);
            if (count > 0) {
                badge.innerText = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        function toggleCart(forceOpen = false) {
            const drawer = document.getElementById('cartDrawer');
            const overlay = document.getElementById('cartDrawerOverlay');
            
            if (forceOpen || !drawer.classList.contains('active')) {
                drawer.classList.add('active');
                overlay.classList.add('active');
                renderCartDrawer();
            } else {
                drawer.classList.remove('active');
                overlay.classList.remove('active');
            }
        }

        function renderCartDrawer() {
            const list = document.getElementById('cartItemsList');
            const totalEl = document.getElementById('cartTotal');
            const subtotalEl = document.getElementById('cartSubtotal');
            list.innerHTML = '';

            if (cart.length === 0) {
                list.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Seu carrinho está vazio.</p>`;
                totalEl.innerText = 'R$ 0,00';
                subtotalEl.innerText = 'R$ 0,00';
                return;
            }

            let total = 0;
            cart.forEach(item => {
                const sub = item.price * item.qty;
                total += sub;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <img src="${item.image || 'https://placehold.co/100'}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">R$ ${Number(item.price).toFixed(2)}</div>
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                        <span class="qty-val">${item.qty}</span>
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                    </div>
                `;
                list.appendChild(itemDiv);
            });

            subtotalEl.innerText = `R$ ${total.toFixed(2)}`;
            totalEl.innerText = `R$ ${total.toFixed(2)}`;
        }

        // WhatsApp Direct Checkout (Targeting 5573981375362)
        function checkoutWhatsApp() {
            if (cart.length === 0) return;

            const address = document.getElementById('cartAddressInput').value || "A combinar no atendimento";
            let msg = "*NOVO PEDIDO - INCLUSÃO ATÍPICA*\n\n";
            let total = 0;

            cart.forEach((item, index) => {
                const sub = item.price * item.qty;
                total += sub;
                msg += `${index + 1}. *${item.name}* (${item.qty}x) = R$ ${sub.toFixed(2)}\n`;
            });

            msg += `\n*Endereço:* ${address}`;
            msg += `\n*Valor Total: R$ ${total.toFixed(2)}*\n\nPor favor, me informe o PIX para pagamento!`;

            const encoded = encodeURIComponent(msg);
            window.open(`https://wa.me/5573981375362?text=${encoded}`, '_blank');
        }

        function buyNowWhatsApp(id) {
            const item = products.find(p => p.id === id);
            if (!item) return;

            const msg = `Olá! Tenho interesse no produto:\n*${item.name}* (R$ ${Number(item.price).toFixed(2)})\n\nPoderia me passar mais informações?`;
            window.open(`https://wa.me/5573981375362?text=${encodeURIComponent(msg)}`, '_blank');
        }

        // Admin Auth
        function openAdminAuth() {
            if (isAdminLoggedIn) {
                switchView('admin');
            } else {
                document.getElementById('adminAuthModal').classList.add('active');
            }
        }

        function closeAdminAuth() {
            document.getElementById('adminAuthModal').classList.remove('active');
            document.getElementById('loginError').style.display = 'none';
        }

        function handleAdminLogin(e) {
            e.preventDefault();
            const pass = document.getElementById('adminPassInput').value;
            if (pass === 'admin123') {
                isAdminLoggedIn = true;
                localStorage.setItem('vanilla_inc_admin', 'true');
                closeAdminAuth();
                switchView('admin');
            } else {
                document.getElementById('loginError').style.display = 'block';
            }
        }

        function logoutAdmin() {
            isAdminLoggedIn = false;
            localStorage.removeItem('vanilla_inc_admin');
            switchView('store');
        }

        // FileReader Image Conversion (Local Computer Upload)
        function handleImageFileUpload(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    uploadedBase64Image = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        // Render Admin Dashboard Metrics & Table
        function renderAdminDashboard() {
            document.getElementById('metricTotal').innerText = products.length;
            
            const totalVal = products.reduce((sum, p) => sum + Number(p.price), 0);
            document.getElementById('metricStockValue').innerText = `R$ ${totalVal.toFixed(2)}`;

            const categories = [...new Set(products.map(p => p.category))];
            document.getElementById('metricCategories').innerText = categories.length;

            const tbody = document.getElementById('adminTableBody');
            tbody.innerHTML = '';

            products.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <img src="${p.image || 'https://placehold.co/100'}" class="table-img">
                            <strong>${p.name}</strong>
                        </div>
                    </td>
                    <td><span style="background: var(--lavender-light); padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.75rem;">${p.category}</span></td>
                    <td style="font-weight: bold; color: var(--rose-deep);">R$ ${Number(p.price).toFixed(2)}</td>
                    <td><span style="color: var(--autism-green); font-weight: bold;">Disponível</span></td>
                    <td style="text-align: right;">
                        <button onclick="editProduct(${p.id})" class="btn" style="padding: 0.3rem 0.6rem; background: #E2E8F0; font-size: 0.75rem;">Editar</button>
                        <button onclick="deleteProduct(${p.id})" class="btn" style="padding: 0.3rem 0.6rem; background: var(--rose-pastel); color: var(--rose-deep); font-size: 0.75rem;">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Product CRUD Modals
        function openProductModal(id = null) {
            uploadedBase64Image = '';
            document.getElementById('productForm').reset();
            document.getElementById('prodId').value = '';

            if (id) {
                document.getElementById('productModalTitle').innerText = "Editar Produto";
                const p = products.find(item => item.id === id);
                if (p) {
                    document.getElementById('prodId').value = p.id;
                    document.getElementById('prodName').value = p.name;
                    document.getElementById('prodPrice').value = p.price;
                    document.getElementById('prodCategory').value = p.category;
                    document.getElementById('prodImageUrl').value = p.image || '';
                    document.getElementById('prodDesc').value = p.description;
                }
            } else {
                document.getElementById('productModalTitle').innerText = "Novo Produto";
            }

            document.getElementById('productModal').classList.add('active');
        }

        function closeProductModal() {
            document.getElementById('productModal').classList.remove('active');
        }

        function saveProduct(e) {
            e.preventDefault();
            const id = document.getElementById('prodId').value;
            const name = document.getElementById('prodName').value;
            const price = parseFloat(document.getElementById('prodPrice').value);
            const category = document.getElementById('prodCategory').value;
            const urlImage = document.getElementById('prodImageUrl').value;
            const description = document.getElementById('prodDesc').value;

            // Priority given to uploaded local image, then URL input, then fallback
            const finalImage = uploadedBase64Image || urlImage || 'https://placehold.co/600x400/F472B6/ffffff?text=Produto';

            if (id) {
                products = products.map(p => p.id == id ? { ...p, name, price, category, image: finalImage, description } : p);
            } else {
                const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
                products.push({ id: newId, name, price, category, image: finalImage, description });
            }

            localStorage.setItem('vanilla_inc_products', JSON.stringify(products));
            closeProductModal();
            renderProducts();
            renderAdminDashboard();
        }

        function editProduct(id) {
            openProductModal(id);
        }

        function deleteProduct(id) {
            if (confirm("Deseja realmente remover este produto do catálogo?")) {
                products = products.filter(p => p.id !== id);
                localStorage.setItem('vanilla_inc_products', JSON.stringify(products));
                renderProducts();
                renderAdminDashboard();
            }
        }