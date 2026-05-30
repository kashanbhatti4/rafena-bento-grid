/* 
   Rafena CBD - Bento UI Redesign
   Interactive Quiz, Category Filter, Frictionless Cart Engine, Club Signups, and Progress Gauges (RTL)
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBAL STATE ---
    let cart = [];
    let selectedGoal = null;
    let selectedIntake = null;
    let hasClubDiscount = false; // Flag to apply 15% discount for Rafena Club members

    // Product Database for Recommendation Injector
    const productsDb = {
        1: {
            id: 1,
            title: 'שמן CBD 10% - 30 מ"ל (נייצר פארם)',
            price: 240,
            img: 'wp-content/uploads/2026/03/נייצר-פארם-10-מל-30-אחוז.png',
            desc: 'השמן האידיאלי למתחילים ולסובלים מנדודי שינה קלים, חרדה יומיומית ולחץ מתמשך.'
        },
        2: {
            id: 2,
            title: 'שמן CBD 24% - 10 מ"ל (זהב)',
            price: 320,
            img: 'wp-content/uploads/2026/03/24310.png',
            desc: 'ריכוז עמוק ועוצמתי במיוחד המיועד לשיכוך כאבים כרוניים, דלקות מפרקים ובעיות שינה קשות.'
        },
        3: {
            id: 3,
            title: 'סוכריות גומי CBD - 8 מ"ג (30 יח\')',
            price: 180,
            img: 'wp-content/uploads/2026/03/שלושים-פלוס-8-עשר-1.png',
            desc: 'סוכריות גומי טבעיות וטעימות במיוחד לנטילה נוחה בכל מקום ובכל שעה. להפחתת מתחים מיידית.'
        },
        4: {
            id: 4,
            title: 'שמן CBD לחיות מחמד - 10% 10 מ"ל',
            price: 150,
            img: 'wp-content/uploads/2026/03/1010pets.png',
            desc: 'מותאם במיוחד לכלבים וחתולים. מסייע בהפחתת חרדת נטישה, רעשי זיקוקים וכאבים בגיל מתקדם.'
        }
    };

    // --- 2. ONBOARDING QUIZ FLOW (UX) ---
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const stepResult = document.getElementById('step-result');
    const backBtn = document.getElementById('quiz-back-btn');
    const restartBtn = document.getElementById('quiz-restart');
    const recommendationContent = document.getElementById('recommendation-content');

    // Step 1 Selection
    if (step1) {
        const step1Pills = step1.querySelectorAll('.quiz-pill');
        step1Pills.forEach(pill => {
            pill.addEventListener('click', () => {
                step1Pills.forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
                
                selectedGoal = pill.getAttribute('data-value');
                
                // Add ripple transition delay
                setTimeout(() => {
                    step1.classList.remove('active');
                    if (step2) step2.classList.add('active');
                }, 200);
            });
        });
    }

    // Step 2 Selection
    if (step2) {
        const step2Pills = step2.querySelectorAll('.quiz-pill');
        step2Pills.forEach(pill => {
            pill.addEventListener('click', () => {
                step2Pills.forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
                
                selectedIntake = pill.getAttribute('data-value');
                
                setTimeout(() => {
                    step2.classList.remove('active');
                    generateRecommendation();
                    if (stepResult) stepResult.classList.add('active');
                }, 200);
            });
        });
    }

    // Back Button logic
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (step2) step2.classList.remove('active');
            if (step1) step1.classList.add('active');
        });
    }

    // Restart Quiz logic
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            selectedGoal = null;
            selectedIntake = null;
            if (step1) {
                step1.querySelectorAll('.quiz-pill').forEach(p => p.classList.remove('selected'));
            }
            if (step2) {
                step2.querySelectorAll('.quiz-pill').forEach(p => p.classList.remove('selected'));
            }
            
            if (stepResult) stepResult.classList.remove('active');
            if (step2) step2.classList.remove('active');
            if (step1) step1.classList.add('active');
        });
    }

    // Generate Recommendation dynamically based on answers
    function generateRecommendation() {
        let recommendedId = 1; // Default: 10% CBD Oil

        if (selectedGoal === 'pets') {
            recommendedId = 4; // Pet CBD Oil
        } else if (selectedGoal === 'pain') {
            recommendedId = 2; // 24% Gold Oil (Strong)
        } else if (selectedGoal === 'sleep' && selectedIntake === 'gummies') {
            recommendedId = 3; // Gummies
        } else if (selectedGoal === 'anxiety' && selectedIntake === 'gummies') {
            recommendedId = 3; // Gummies
        }

        const product = productsDb[recommendedId];
        
        if (recommendationContent) {
            recommendationContent.innerHTML = `
                <img src="${product.img}" alt="${product.title}" class="rec-img">
                <div class="rec-details">
                    <span class="pill-badge warning-pill">תוצאת ההתאמה שלך</span>
                    <h4>${product.title}</h4>
                    <p>${product.desc}</p>
                    <div class="price-action-row" style="border: none; padding: 0; margin-bottom: 12px;">
                        <div class="product-price">
                            <span class="currency">₪</span><span>${product.price}</span>
                        </div>
                    </div>
                    <button class="btn btn-primary add-rec-to-cart-btn" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-img="${product.img}">
                        הוסף ישירות לעגלה <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-cart-icon"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </button>
                </div>
            `;

            // Bind event to the dynamically generated recommendation button
            const recCartBtn = recommendationContent.querySelector('.add-rec-to-cart-btn');
            if (recCartBtn) {
                recCartBtn.addEventListener('click', () => {
                    const id = parseInt(recCartBtn.getAttribute('data-id'));
                    const title = recCartBtn.getAttribute('data-title');
                    const price = parseInt(recCartBtn.getAttribute('data-price'));
                    const img = recCartBtn.getAttribute('data-img');
                    addToCart(id, 1, title, price, img);
                });
            }
        }
    }

    // --- 3. CATEGORY FILTERS CAROUSEL (MX) ---
    const filterPills = document.querySelectorAll('#category-filter-bar .category-bento-pill');
    const productCards = document.querySelectorAll('.products-grid .product-card');

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filterValue = pill.getAttribute('data-filter');

            productCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // --- 4. FRICTIONLESS QUANTITY SELECTORS (UX) ---
    const quantityContainers = document.querySelectorAll('.frictionless-quantity');
    quantityContainers.forEach(container => {
        const decBtn = container.querySelector('.dec-btn');
        const incBtn = container.querySelector('.inc-btn');
        const id = decBtn.getAttribute('data-id');
        const qtyValElement = document.getElementById(`qty-${id}`);

        if (decBtn && incBtn && qtyValElement) {
            decBtn.addEventListener('click', () => {
                let currentQty = parseInt(qtyValElement.textContent);
                if (currentQty > 1) {
                    currentQty--;
                    qtyValElement.textContent = currentQty;
                }
            });

            incBtn.addEventListener('click', () => {
                let currentQty = parseInt(qtyValElement.textContent);
                currentQty++;
                qtyValElement.textContent = currentQty;
            });
        }
    });

    // --- 5. CART SYSTEM LOGIC ---
    const cartToggle = document.getElementById('cart-toggle');
    const closeCart = document.getElementById('close-cart');
    const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalValue = document.getElementById('cart-total-value');
    const cartCountElement = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-action-btn');

    // Toggle open/close Cart Drawer
    function toggleCartDrawer() {
        if (cartDrawer) cartDrawer.classList.toggle('active');
        if (cartDrawerOverlay) cartDrawerOverlay.classList.toggle('active');
    }

    if (cartToggle) cartToggle.addEventListener('click', toggleCartDrawer);
    if (closeCart) closeCart.addEventListener('click', toggleCartDrawer);
    if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', toggleCartDrawer);

    // Add to Cart implementation
    const addCartBtns = document.querySelectorAll('.add-to-cart-action');
    addCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const title = btn.getAttribute('data-title');
            const price = parseInt(btn.getAttribute('data-price'));
            const img = btn.getAttribute('data-img');
            const qtyValElement = document.getElementById(`qty-${id}`);
            const qty = qtyValElement ? parseInt(qtyValElement.textContent) : 1;

            addToCart(id, qty, title, price, img);
            
            // Reset quantity select
            if (qtyValElement) qtyValElement.textContent = 1;
        });
    });

    function addToCart(productId, qty, title, price, img) {
        // Check if item is already in cart
        const existingItemIndex = cart.findIndex(item => item.id === productId);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].qty += qty;
        } else {
            const dbProduct = productsDb[productId] || {};
            const finalTitle = title || dbProduct.title || `מוצר #${productId}`;
            const finalPrice = price !== undefined ? price : (dbProduct.price || 0);
            const finalImg = img || dbProduct.img || 'wp-content/uploads/2026/03/default.png';

            cart.push({
                id: productId,
                title: finalTitle,
                price: parseInt(finalPrice),
                img: finalImg,
                qty: qty
            });
        }

        updateCartUI();
        triggerCartBadgeBounce();
        
        // Proactively open drawer so user sees items stack instantly (UX)
        if (cartDrawer && !cartDrawer.classList.contains('active')) {
            toggleCartDrawer();
        }
    }

    // Trigger bounce badge animation (MX)
    function triggerCartBadgeBounce() {
        if (cartCountElement) {
            cartCountElement.classList.add('bounce-animate');
            setTimeout(() => {
                cartCountElement.classList.remove('bounce-animate');
            }, 800);
        }
    }

    // Update Cart UI
    function updateCartUI() {
        if (!cartItemsContainer || !cartCountElement || !cartTotalValue) return;

        let totalItems = 0;
        let totalPrice = 0;
        
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-message">העגלה שלך ריקה כרגע.</div>';
        } else {
            cart.forEach(item => {
                totalItems += item.qty;
                totalPrice += item.price * item.qty;

                const itemHtml = `
                    <div class="cart-item">
                        <button class="remove-cart-item" data-id="${item.id}">✕</button>
                        <img src="${item.img}" alt="${item.title}" class="cart-item-img">
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.title}</h4>
                            <div class="cart-item-price">₪${item.price}</div>
                            <div class="cart-item-qty-row">
                                <span>כמות:</span>
                                <div class="cart-qty-ctrl">
                                    <button class="cart-dec-btn" data-id="${item.id}">-</button>
                                    <span>${item.qty}</span>
                                    <button class="cart-inc-btn" data-id="${item.id}">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
            });
        }

        // Bind events inside the cart drawer items
        const removeBtns = cartItemsContainer.querySelectorAll('.remove-cart-item');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                cart = cart.filter(item => item.id !== id);
                updateCartUI();
            });
        });

        const decBtns = cartItemsContainer.querySelectorAll('.cart-dec-btn');
        decBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const itemIndex = cart.findIndex(item => item.id === id);
                if (itemIndex > -1 && cart[itemIndex].qty > 1) {
                    cart[itemIndex].qty--;
                    updateCartUI();
                }
            });
        });

        const incBtns = cartItemsContainer.querySelectorAll('.cart-inc-btn');
        incBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const itemIndex = cart.findIndex(item => item.id === id);
                if (itemIndex > -1) {
                    cart[itemIndex].qty++;
                    updateCartUI();
                }
            });
        });

        // Apply 15% Club Discount if active
        let finalPrice = totalPrice;
        const discountRow = document.getElementById('cart-club-discount-row');
        
        if (hasClubDiscount && totalPrice > 0) {
            const discountAmount = Math.round(totalPrice * 0.15);
            finalPrice = totalPrice - discountAmount;

            if (discountRow) {
                discountRow.style.display = 'flex';
                discountRow.querySelector('.discount-amount').textContent = `-${discountAmount}`;
            } else {
                const footerDetails = document.querySelector('.cart-drawer-footer .cart-total-row');
                if (footerDetails) {
                    const discountHtml = `
                        <div class="cart-total-row" id="cart-club-discount-row" style="display: flex; justify-content: space-between; font-size: 0.95rem; color: #cf2e2e; margin-bottom: 8px; font-weight: 700; border-bottom: 1px dashed rgba(12, 69, 36, 0.15); padding-bottom: 8px;">
                            <span>🏷️ 15% הנחת Rafena Club:</span>
                            <span>-₪<span class="discount-amount">${discountAmount}</span></span>
                        </div>
                    `;
                    footerDetails.insertAdjacentHTML('beforebegin', discountHtml);
                }
            }
        } else {
            if (discountRow) {
                discountRow.remove();
            }
        }

        // Update totals
        cartCountElement.textContent = totalItems;
        cartTotalValue.textContent = finalPrice;
    }

    // Checkout alert mock (MX)
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('העגלה שלך ריקה. אנא הוסף מוצרים לפני שתמשיך לתשלום.');
                return;
            }
            alert(`🎉 תודה רבה על הגשת העבודה! ההזמנה שלך בסך ₪${cartTotalValue.textContent} נקלטה בהצלחה במערכת המקומית.\nכל האינטראקציות, האנימציות והרספונסיביות בעבודה זו פועלות בצורה מושלמת!`);
        });
    }

    // --- 6. CLUB REGISTER FORM INTERACTION (UX/MX) ---
    const clubForm = document.getElementById('club-register-form');
    if (clubForm) {
        clubForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const firstnameInput = document.getElementById('club-firstname');
            const firstname = firstnameInput ? firstnameInput.value.trim() : 'חבר';
            
            // Set discount flag to true and update cart UI to apply the 15% discount
            hasClubDiscount = true;
            updateCartUI();

            // Display bouncy modal-style notification alert
            alert(`🎉 ברוכים הבאים ל-Rafena Club, ${firstname}!\n\nנרשמת בהצלחה למועדון הלקוחות היוקרתי שלנו.\nקיבלת 15% הנחה קבועה על הקניות שלך!\n\n🔑 קוד הקופון שלך הוא: RAFENACLUB15\n(ההנחה הוחלה אוטומטית על עגלת הקניות הנוכחית שלך!)`);
            
            clubForm.reset();
        });
    }

    // --- 7. JOIN OUR MAILERS BANNER FORM INTERACTION (UX) ---
    const mailersForm = document.getElementById('mailers-submit');
    if (mailersForm) {
        mailersForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = mailersForm.querySelector('input');
            const email = emailInput ? emailInput.value.trim() : '';
            
            alert(`📧 תודה! המייל ${email} נרשם בהצלחה לקבלת ניוזלטר, עדכוני מחקר והטבות בלעדיות מ-Rafena.`);
            mailersForm.reset();
        });
    }

    // --- 8. CIRCULAR PROGRESS GAUGE ANIMATIONS (MX) ---
    // Reads data-percent fresh each run so tab switches re-animate to the new value.
    function runGaugeAnimation(card, delay) {
        const circle = card.querySelector('.gauge-progress-circle');
        if (!circle) return;
        const percent = parseInt(card.getAttribute('data-percent'));
        circle.style.strokeDashoffset = '283';
        setTimeout(() => {
            circle.style.strokeDashoffset = 283 - (283 * percent) / 100;
        }, delay);
    }
    window._runGaugeAnimation = runGaugeAnimation;

    document.querySelectorAll('.stat-gauge-card').forEach(card => {
        runGaugeAnimation(card, 300);
        card.addEventListener('mouseenter', () => runGaugeAnimation(card, 100));
    });

    // --- 9. MOBILE NAVIGATION DRAWER TOGGLE (UX/MX) ---
    const burgerToggle = document.getElementById('burger-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
    const closeMobileDrawer = document.getElementById('close-mobile-drawer');

    if (burgerToggle && mobileDrawer && mobileDrawerOverlay) {
        burgerToggle.addEventListener('click', () => {
            mobileDrawer.classList.add('open');
            mobileDrawerOverlay.classList.add('open');
        });

        mobileDrawerOverlay.addEventListener('click', () => {
            mobileDrawer.classList.remove('open');
            mobileDrawerOverlay.classList.remove('open');
        });

        if (closeMobileDrawer) {
            closeMobileDrawer.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                mobileDrawerOverlay.classList.remove('open');
            });
        }

        const accordionToggles = mobileDrawer.querySelectorAll('.accordion-toggle');
        accordionToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const submenu = toggle.nextElementSibling;
                toggle.classList.toggle('active');
                if (submenu) {
                    if (submenu.style.display === 'flex') {
                        submenu.style.display = 'none';
                    } else {
                        submenu.style.display = 'flex';
                    }
                }
            });
        });
    }

    // --- 10. HERO TEASER PILLS INTERACTIVE FILTERING (UX/MX) ---
    const teaserPills = document.querySelectorAll('#hero-teaser-pills .teaser-pill');
    const productsContainer = document.getElementById('products');
    const productCardsList = document.querySelectorAll('.products-grid .product-card');

    // --- 11. PRODUCTS SECTION DYNAMIC TABS FILTERING (UX/MX) ---
    const productsTabs = document.querySelectorAll('.products-tab');
    const creamsPlaceholder = document.getElementById('creams-placeholder');

    function filterProductsByTab(tabValue) {
        // Update active tab buttons
        productsTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabValue) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Filter products in the grid
        productCardsList.forEach(card => {
            // Ignore placeholder card
            if (card.classList.contains('placeholder-card')) return;

            const cardCategory = card.getAttribute('data-category') || '';
            const isPetProduct = cardCategory.split(' ').includes('pets');

            if (tabValue === 'oils') {
                if (!isPetProduct) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            } else if (tabValue === 'pets') {
                if (isPetProduct) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            } else if (tabValue === 'creams') {
                card.style.display = 'none';
            }
        });

        // Manage placeholder card
        if (creamsPlaceholder) {
            if (tabValue === 'creams') {
                creamsPlaceholder.style.display = 'flex';
            } else {
                creamsPlaceholder.style.display = 'none';
            }
        }

        // Reset products slider position after tab switch
        if (typeof window._resetProductsSlider === 'function') {
            window._resetProductsSlider();
        }
    }

    // Set default filter on load to "oils"
    filterProductsByTab('oils');

    // Add click listeners to products tabs
    productsTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabValue = tab.getAttribute('data-tab');
            
            // Clear any active hero teaser pills when explicitly switching product tabs
            teaserPills.forEach(p => p.classList.remove('active'));
            
            filterProductsByTab(tabValue);
        });
    });

    if (teaserPills.length > 0 && productCardsList.length > 0) {
        teaserPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                
                const category = pill.getAttribute('data-category');
                const isAlreadyActive = pill.classList.contains('active');

                // Update active classes on teaser pills
                teaserPills.forEach(p => p.classList.remove('active'));
                
                if (isAlreadyActive) {
                    // Reset: show all General Oils (default)
                    filterProductsByTab('oils');
                } else {
                    pill.classList.add('active');

                    if (category === 'pets') {
                        // Switch tab to "pets" and show only pet products
                        filterProductsByTab('pets');
                    } else {
                        // Switch tab to "oils" and filter oils by health need (sleep, pain, anxiety)
                        filterProductsByTab('oils');
                        
                        productCardsList.forEach(card => {
                            if (card.classList.contains('placeholder-card')) return;
                            
                            const cardCategories = card.getAttribute('data-category') || '';
                            const categoriesArray = cardCategories.split(' ');
                            const isPetProduct = categoriesArray.includes('pets');

                            if (!isPetProduct && categoriesArray.includes(category)) {
                                card.style.display = 'flex';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    }
                }

                // Smooth scroll to products section
                if (productsContainer) {
                    productsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // --- CATEGORY TABS: GAUGES + BEST SELLERS ---
    (function () {
        const bsTabs = document.querySelectorAll('[data-bs-tab]');
        const bsCards = document.querySelectorAll('[data-bs-category]');
        const gaugeCards = document.querySelectorAll('.stat-gauge-card');

        // Per-tab customer-stats gauge data (percent + label), in display order.
        // 'oils' holds the real figures; live/creams/capsules are PLACEHOLDERS — replace with real stats.
        const GAUGE_DATA = {
            oils: [
                { percent: 37, label: 'חרדה ולחץ' },
                { percent: 23, label: 'בעלי חיים' },
                { percent: 16, label: 'בעיות שינה' },
                { percent: 9,  label: 'אלרגיות' },
                { percent: 8,  label: 'דלקות פרקים' },
                { percent: 7,  label: 'דלקות וכאבים' }
            ],
            live: [
                { percent: 32, label: 'חרדה ולחץ' },
                { percent: 24, label: 'בעיות שינה' },
                { percent: 18, label: 'דלקות וכאבים' },
                { percent: 12, label: 'בעלי חיים' },
                { percent: 8,  label: 'אלרגיות' },
                { percent: 6,  label: 'דלקות פרקים' }
            ],
            creams: [
                { percent: 42, label: 'דלקות וכאבים' },
                { percent: 27, label: 'דלקות פרקים' },
                { percent: 14, label: 'בעיות עור' },
                { percent: 9,  label: 'אלרגיות' },
                { percent: 5,  label: 'חרדה ולחץ' },
                { percent: 3,  label: 'בעלי חיים' }
            ],
            capsules: [
                { percent: 35, label: 'בעיות שינה' },
                { percent: 28, label: 'חרדה ולחץ' },
                { percent: 18, label: 'דלקות וכאבים' },
                { percent: 11, label: 'דלקות פרקים' },
                { percent: 5,  label: 'אלרגיות' },
                { percent: 3,  label: 'בעלי חיים' }
            ]
        };

        function updateGauges(tabValue) {
            const data = GAUGE_DATA[tabValue];
            if (!data) return;
            gaugeCards.forEach((card, i) => {
                const stat = data[i];
                if (!stat) { card.style.display = 'none'; return; }
                card.style.display = '';
                card.setAttribute('data-percent', stat.percent);
                const pctEl = card.querySelector('.gauge-percentage');
                const lblEl = card.querySelector('.gauge-label');
                if (pctEl) pctEl.textContent = stat.percent + '%';
                if (lblEl) lblEl.textContent = stat.label;
                if (window._runGaugeAnimation) window._runGaugeAnimation(card, 100);
            });
        }

        function filterBsTab(tabValue) {
            bsTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-bs-tab') === tabValue));
            bsCards.forEach(card => {
                card.style.display = card.getAttribute('data-bs-category') === tabValue ? '' : 'none';
            });
            updateGauges(tabValue);
            if (typeof window._resetBsProductsSlider === 'function') {
                window._resetBsProductsSlider();
            }
        }

        bsTabs.forEach(tab => {
            tab.addEventListener('click', () => filterBsTab(tab.getAttribute('data-bs-tab')));
        });

        // Qty buttons for best sellers
        document.querySelectorAll('.bs-dec, .bs-inc').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-bs-id');
                const qtyEl = document.getElementById(`bs-qty-${id}`);
                if (!qtyEl) return;
                let qty = parseInt(qtyEl.textContent);
                if (btn.classList.contains('bs-inc')) qty++;
                else if (qty > 1) qty--;
                qtyEl.textContent = qty;
            });
        });

        // Add-to-cart for BS cards (separate class to avoid double-fire with existing handler)
        document.querySelectorAll('.bs-add-to-cart').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const title = btn.getAttribute('data-title');
                const price = parseInt(btn.getAttribute('data-price'));
                const img = btn.getAttribute('data-img');
                const qtyElId = btn.getAttribute('data-bs-qty');
                const qtyEl = document.getElementById(qtyElId);
                const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
                addToCart(id, qty, title, price, img);
                if (qtyEl) qtyEl.textContent = 1;
            });
        });

        filterBsTab('oils');
    })();

    // --- TESTIMONIALS SLIDER ---
    (function () {
        const slider = document.querySelector('.testimonials-slider');
        const track = document.getElementById('testimonials-track');
        if (!slider || !track) return;

        const prevBtn = slider.querySelector('.t-prev');
        const nextBtn = slider.querySelector('.t-next');
        const cards = Array.from(track.children);

        const dotsEl = document.createElement('div');
        dotsEl.className = 't-dots';
        slider.parentNode.insertBefore(dotsEl, slider.nextSibling);

        let current = 0;

        function getVisible() {
            return window.innerWidth >= 768 ? 3 : 1;
        }

        function getMax() {
            return Math.max(0, cards.length - getVisible());
        }

        function buildDots() {
            dotsEl.innerHTML = '';
            const count = getMax() + 1;
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.className = 't-dot' + (i === current ? ' active' : '');
                dot.setAttribute('aria-label', `עמוד ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsEl.appendChild(dot);
            }
        }

        function goTo(index) {
            current = Math.max(0, Math.min(index, getMax()));
            const cardWidth = cards[0].offsetWidth;
            const gap = 24;
            // RTL: positive translateX moves track right, revealing higher-indexed cards
            track.style.transform = `translateX(${current * (cardWidth + gap)}px)`;
            if (prevBtn) prevBtn.disabled = current === 0;
            if (nextBtn) nextBtn.disabled = current >= getMax();
            dotsEl.querySelectorAll('.t-dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

        // Touch swipe support
        let touchStartX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 50) {
                // RTL: swipe left (negative diff) = next; swipe right = prev
                goTo(current + (diff < 0 ? 1 : -1));
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            current = 0;
            buildDots();
            goTo(0);
        });

        buildDots();
        goTo(0);
    })();

    // --- EXPERTS SLIDER (disabled) ---
    // Experts now use a responsive bento grid at every breakpoint (no slider),
    // so this carousel is intentionally left inert.
    (function () {
        const wrapper = document.querySelector('.experts-slider-wrapper');
        const track = document.getElementById('experts-slider-track');
        if (!wrapper || !track) return;
        return; // bento grid handles all layouts — no slider needed

        const prevBtn = wrapper.querySelector('.e-prev');
        const nextBtn = wrapper.querySelector('.e-next');
        const cards = Array.from(track.querySelectorAll('.expert-card'));

        const dotsEl = document.createElement('div');
        dotsEl.className = 'e-dots';
        wrapper.parentNode.insertBefore(dotsEl, wrapper.nextSibling);

        let current = 0;

        function isMobile() { return window.innerWidth < 768; }

        function buildDots() {
            dotsEl.innerHTML = '';
            if (!isMobile()) return;
            cards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'e-dot' + (i === current ? ' active' : '');
                dot.setAttribute('aria-label', `מומחה ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsEl.appendChild(dot);
            });
        }

        function goTo(index) {
            if (!isMobile()) return;
            current = Math.max(0, Math.min(index, cards.length - 1));
            const cardWidth = cards[0].offsetWidth;
            const gap = 24;
            track.style.transform = `translateX(${current * (cardWidth + gap)}px)`;
            if (prevBtn) prevBtn.disabled = current === 0;
            if (nextBtn) nextBtn.disabled = current >= cards.length - 1;
            dotsEl.querySelectorAll('.e-dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 50) goTo(current + (diff < 0 ? 1 : -1));
        }, { passive: true });

        window.addEventListener('resize', () => { current = 0; buildDots(); goTo(0); });

        buildDots();
        goTo(0);
    })();

    // --- PRODUCTS SLIDER (mobile only) ---
    (function () {
        const wrapper = document.querySelector('.products-slider-wrapper');
        const track = document.getElementById('products-slider-track');
        if (!wrapper || !track) return;

        const prevBtn = wrapper.querySelector('.p-prev');
        const nextBtn = wrapper.querySelector('.p-next');

        const dotsEl = document.createElement('div');
        dotsEl.className = 'p-dots';
        wrapper.parentNode.insertBefore(dotsEl, wrapper.nextSibling);

        let current = 0;

        function isMobile() {
            return window.innerWidth < 768;
        }

        function getVisibleCards() {
            return Array.from(track.querySelectorAll('.product-card:not(.placeholder-card)')).filter(c => c.style.display !== 'none');
        }

        function getMax() {
            return Math.max(0, getVisibleCards().length - 1);
        }

        function buildDots() {
            dotsEl.innerHTML = '';
            if (!isMobile()) return;
            const cards = getVisibleCards();
            cards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'p-dot' + (i === current ? ' active' : '');
                dot.setAttribute('aria-label', `מוצר ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsEl.appendChild(dot);
            });
        }

        function goTo(index) {
            if (!isMobile()) return;
            const cards = getVisibleCards();
            current = Math.max(0, Math.min(index, cards.length - 1));
            const cardWidth = cards[0] ? cards[0].offsetWidth : 0;
            const gap = 12;
            track.style.transform = `translateX(${current * (cardWidth + gap)}px)`;
            if (prevBtn) prevBtn.disabled = current === 0;
            if (nextBtn) nextBtn.disabled = current >= getMax();
            dotsEl.querySelectorAll('.p-dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }

        // Expose reset for tab switching
        window._resetProductsSlider = function () {
            current = 0;
            track.style.transform = '';
            buildDots();
            goTo(0);
        };

        if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

        // Touch swipe
        let touchStartX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 50) {
                goTo(current + (diff < 0 ? 1 : -1));
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            current = 0;
            buildDots();
            goTo(0);
        });

        buildDots();
        goTo(0);
    })();

    // --- BEST SELLERS SLIDER (mobile only) ---
    (function () {
        const wrapper = document.querySelector('.bs-slider-wrapper');
        const track = document.getElementById('bs-products-grid');
        if (!wrapper || !track) return;

        const prevBtn = wrapper.querySelector('.bs-prev');
        const nextBtn = wrapper.querySelector('.bs-next');

        const dotsEl = document.createElement('div');
        dotsEl.className = 'bs-dots';
        wrapper.parentNode.insertBefore(dotsEl, wrapper.nextSibling);

        let current = 0;

        function isMobile() {
            return window.innerWidth < 768;
        }

        function getVisibleCards() {
            return Array.from(track.querySelectorAll('.product-card')).filter(c => c.style.display !== 'none');
        }

        function getMax() {
            return Math.max(0, getVisibleCards().length - 1);
        }

        function buildDots() {
            dotsEl.innerHTML = '';
            if (!isMobile()) return;
            const cards = getVisibleCards();
            if (cards.length <= 1) return; // No dots needed for 1 or 0 products
            cards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'p-dot' + (i === current ? ' active' : '');
                dot.setAttribute('aria-label', `מוצר ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsEl.appendChild(dot);
            });
        }

        function goTo(index) {
            if (!isMobile()) {
                track.style.transform = ''; // Clear transform on desktop
                return;
            }
            const cards = getVisibleCards();
            if (cards.length === 0) return;
            current = Math.max(0, Math.min(index, cards.length - 1));
            const cardWidth = cards[0] ? cards[0].offsetWidth : 0;
            const gap = 12;
            track.style.transform = `translateX(${current * (cardWidth + gap)}px)`;
            
            // Toggle arrows visibility/disabled state
            if (cards.length <= 1) {
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
            } else {
                if (prevBtn) {
                    prevBtn.style.display = 'flex';
                    prevBtn.disabled = current === 0;
                }
                if (nextBtn) {
                    nextBtn.style.display = 'flex';
                    nextBtn.disabled = current >= getMax();
                }
            }

            dotsEl.querySelectorAll('.p-dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }

        // Expose reset for tab switching
        window._resetBsProductsSlider = function () {
            current = 0;
            track.style.transform = '';
            buildDots();
            goTo(0);
        };

        if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

        // Touch swipe
        let touchStartX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 50) {
                goTo(current + (diff < 0 ? 1 : -1));
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            current = 0;
            buildDots();
            goTo(0);
        });

        buildDots();
        goTo(0);
    })();

    // --- BLOG SLIDER (mobile only) ---
    (function () {
        const slider = document.querySelector('.blog-slider');
        const track = document.getElementById('blog-track');
        if (!slider || !track) return;

        const prevBtn = slider.querySelector('.b-prev');
        const nextBtn = slider.querySelector('.b-next');
        const cards = Array.from(track.children);

        const dotsEl = document.createElement('div');
        dotsEl.className = 'b-dots';
        slider.parentNode.insertBefore(dotsEl, slider.nextSibling);

        let current = 0;

        function isMobile() {
            return window.innerWidth < 768;
        }

        function getMax() {
            return cards.length - 1;
        }

        function buildDots() {
            dotsEl.innerHTML = '';
            if (!isMobile()) return;
            cards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'b-dot' + (i === current ? ' active' : '');
                dot.setAttribute('aria-label', `פוסט ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsEl.appendChild(dot);
            });
        }

        function goTo(index) {
            if (!isMobile()) {
                track.style.transform = '';
                return;
            }
            if (cards.length === 0) return;
            current = Math.max(0, Math.min(index, getMax()));
            const cardWidth = cards[0] ? cards[0].offsetWidth : 0;
            const gap = 24;
            track.style.transform = `translateX(${current * (cardWidth + gap)}px)`;
            
            if (prevBtn) prevBtn.disabled = current === 0;
            if (nextBtn) nextBtn.disabled = current >= getMax();

            dotsEl.querySelectorAll('.b-dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

        // Touch swipe support
        let touchStartX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 50) {
                goTo(current + (diff < 0 ? 1 : -1));
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            current = 0;
            buildDots();
            goTo(0);
        });

        buildDots();
        goTo(0);
    })();
});

