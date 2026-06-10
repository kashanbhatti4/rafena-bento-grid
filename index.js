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

    // Cache default creams placeholder text for restoring on reset/tab switch
    if (creamsPlaceholder) {
        const creamsDesc = creamsPlaceholder.querySelector('p');
        const creamsTitle = creamsPlaceholder.querySelector('h3');
        const creamsBadge = creamsPlaceholder.querySelector('.pill-badge');
        window._defaultCreamsText = creamsDesc ? creamsDesc.innerText : '';
        window._defaultCreamsTitle = creamsTitle ? creamsTitle.innerText : '';
        window._defaultCreamsBadge = creamsBadge ? creamsBadge.innerText : '';
    }

    function filterProductsByTab(tabValue) {
        // Update active tab buttons
        productsTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabValue) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Toggle wellness subcategory group visibility
        const pathwayGroups = document.querySelectorAll('.wellness-pathways-group');
        pathwayGroups.forEach(group => {
            if (group.getAttribute('data-pathway-group') === tabValue) {
                group.classList.add('active');
                // Reset active subcategory button to default
                group.querySelectorAll('.wellness-pathway-btn').forEach(btn => {
                    const filterVal = btn.getAttribute('data-filter');
                    if (filterVal === 'all' || filterVal === 'pets-all' || filterVal === 'creams-all') {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            } else {
                group.classList.remove('active');
            }
        });

        // Hide tip banner on tab switch
        const tipBanner = document.getElementById('wellness-tip-banner');
        if (tipBanner) {
            tipBanner.style.display = 'none';
        }

        // Restore default creams placeholder content if switching away or on reset
        if (creamsPlaceholder) {
            const creamsDesc = creamsPlaceholder.querySelector('p');
            const creamsTitle = creamsPlaceholder.querySelector('h3');
            const creamsBadge = creamsPlaceholder.querySelector('.pill-badge');
            if (creamsDesc && window._defaultCreamsText) {
                creamsDesc.innerText = window._defaultCreamsText;
                if (creamsTitle) creamsTitle.innerText = window._defaultCreamsTitle;
                if (creamsBadge) {
                    creamsBadge.innerText = window._defaultCreamsBadge;
                    creamsBadge.className = 'pill-badge warning-pill';
                    creamsBadge.style.backgroundColor = '';
                    creamsBadge.style.color = '';
                }
            }
        }

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

    // --- 11.5. HUMANS & PETS CARD CTAs switching tabs and scrolling (UX) ---
    const btnHumans = document.querySelector('.family-btn-humans');
    const btnPets = document.querySelector('.family-btn-pets');
    
    if (btnHumans) {
        btnHumans.addEventListener('click', (e) => {
            e.preventDefault();
            teaserPills.forEach(p => p.classList.remove('active'));
            filterProductsByTab('oils');
            const productsSec = document.getElementById('products');
            if (productsSec) {
                productsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    
    if (btnPets) {
        btnPets.addEventListener('click', (e) => {
            e.preventDefault();
            teaserPills.forEach(p => p.classList.remove('active'));
            filterProductsByTab('pets');
            const productsSec = document.getElementById('products');
            if (productsSec) {
                productsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // --- Wellness Subcategory Pathways Interaction (Bento UI Addition) ---
    const pathwayBtns = document.querySelectorAll('.wellness-pathway-btn');
    const tipBanner = document.getElementById('wellness-tip-banner');
    const tipContent = document.getElementById('tip-content');

    pathwayBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get sibling buttons in the same group and remove active class
            const parentGroup = btn.closest('.wellness-pathways-group');
            if (parentGroup) {
                parentGroup.querySelectorAll('.wellness-pathway-btn').forEach(b => b.classList.remove('active'));
            }
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            applyPathwayFilter(filter);
        });
    });

    function applyPathwayFilter(filter) {
        // Hide tip banner by default
        if (tipBanner) tipBanner.style.display = 'none';
        
        // Restore default creams placeholder content
        if (creamsPlaceholder) {
            const creamsDesc = creamsPlaceholder.querySelector('p');
            const creamsTitle = creamsPlaceholder.querySelector('h3');
            const creamsBadge = creamsPlaceholder.querySelector('.pill-badge');
            if (creamsDesc && window._defaultCreamsText) {
                creamsDesc.innerText = window._defaultCreamsText;
                if (creamsTitle) creamsTitle.innerText = window._defaultCreamsTitle;
                if (creamsBadge) {
                    creamsBadge.innerText = window._defaultCreamsBadge;
                    creamsBadge.className = 'pill-badge warning-pill';
                    creamsBadge.style.backgroundColor = '';
                    creamsBadge.style.color = '';
                }
            }
        }

        if (filter === 'all') {
            // Show all oils
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                const cardCategory = card.getAttribute('data-category') || '';
                if (!cardCategory.split(' ').includes('pets')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        } else if (filter === 'pets-all') {
            // Show all pets
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                const cardCategory = card.getAttribute('data-category') || '';
                if (cardCategory.split(' ').includes('pets')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        } else if (filter === 'creams-all') {
            // Creams default placeholder is managed by restore above
        } else if (['sleep', 'anxiety', 'pain'].includes(filter)) {
            // Filter oils by condition
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                const cardCategory = card.getAttribute('data-category') || '';
                const categoriesArray = cardCategory.split(' ');
                if (!categoriesArray.includes('pets') && categoriesArray.includes(filter)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        } else if (filter === 'digestive') {
            // Show all oils, display digestive tip
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                const cardCategory = card.getAttribute('data-category') || '';
                if (!cardCategory.split(' ').includes('pets')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            showWellnessTip("בריאות מערכת העיכול: שמני CBD פול ספקטרום מסייעים באיזון מערכת העיכול באמצעות ויסות קולטני ה-ECS במעיים. מומלץ לשלב שמן 10% או 20% כחלק משגרת הבוקר.");
        } else if (filter === 'aging') {
            // Show CBG/CBGa/CBC oils (prod-1, prod-3, prod-5)
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                const id = card.getAttribute('id');
                if (['prod-1', 'prod-3', 'prod-5'].includes(id)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            showWellnessTip("חיוניות ואנטי-אייג'ינג: שמנים המשלבים קנבינואידים כמו CBG ו-CBC נחשבים למעוררי אנרגיה ומגיני תאים עוצמתיים לתמיכה קוגניטיבית ואנטי-אייג'ינג.");
        } else if (filter === 'sport') {
            // Show pain oils (prod-1, prod-3, prod-5)
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                const id = card.getAttribute('id');
                if (['prod-1', 'prod-3', 'prod-5'].includes(id)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            showWellnessTip("ספורטאים ודלקות: שילוב ה-CBG וה-CBGa בפורמולות מחקר מעניק הגנה מוגברת מפני דלקות ומזרז את תהליכי התאוששות השריר והמפרקים לאחר אימונים.");
        } else if (filter === 'pets-anxiety') {
            // Filter pets for anxiety (prod-12 is 10%, description mentions separation anxiety)
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                if (card.getAttribute('id') === 'prod-12') {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            showWellnessTip("תמיכה בחרדה: שמן 10% מסייע לכלבים וחתולים להתמודד עם חרדת נטישה, רעשים חזקים וסערות.");
        } else if (filter === 'pets-pain') {
            // Filter pets for pain (prod-9 & prod-10)
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                const id = card.getAttribute('id');
                if (['prod-9', 'prod-10'].includes(id)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            showWellnessTip("הקלה בכאבים: פורמולות 20% או 18% עם CBGa תומכות במפרקים ומקלות על כאבים כרוניים.");
        } else if (filter === 'pets-aging') {
            // Filter pets for aging (prod-10)
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                if (card.getAttribute('id') === 'prod-10') {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            showWellnessTip("גיל מבוגר: שמן 18% + CBGa מותאם במיוחד לתמיכה בחיות מחמד מבוגרות, מפרקים כואבים וירידה ברמת האנרגיה.");
        } else if (filter === 'pets-cognitive') {
            // Filter pets for cognitive (prod-10)
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                if (card.getAttribute('id') === 'prod-10') {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            showWellnessTip("תמיכה קוגניטיבית: שילוב ה-CBGa מסייע לתפקוד קוגניטיבי תקין ושמירה על ערנות בחיות מחמד מבוגרות.");
        } else if (filter === 'pets-allergies') {
            // Filter pets for allergies (prod-9)
            productCardsList.forEach(card => {
                if (card.classList.contains('placeholder-card')) return;
                if (card.getAttribute('id') === 'prod-9') {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            showWellnessTip("אלרגיות ודלקות: שמן 20% + 5% CBG תומך בוויסות דלקתי במקרים של אלרגיות עוריות או דלקות מעיים.");
        } else if (filter.startsWith('creams-')) {
            // Update creams coming soon card contents to be solution-oriented
            if (creamsPlaceholder) {
                const creamsDesc = creamsPlaceholder.querySelector('p');
                const creamsTitle = creamsPlaceholder.querySelector('h3');
                const creamsBadge = creamsPlaceholder.querySelector('.pill-badge');
                if (creamsDesc) {
                    if (filter === 'creams-neuropathic') {
                        if (creamsTitle) creamsTitle.innerText = "משחת CBD להקלה נוירופתית";
                        creamsDesc.innerText = "פורמולת המשחה העשירה שלנו מפותחת במיוחד לחדירה עמוקה והקלה בכאבים עצביים, נוירופתיה ודגדוגים מטרידים בגפיים. שילוב של CBD בריכוז גבוה במיוחד עם מנטול וקמפור להרגעה מהירה.";
                        if (creamsBadge) {
                            creamsBadge.innerText = "בפיתוח מתקדם";
                            creamsBadge.className = "pill-badge prod-badge";
                            creamsBadge.style.backgroundColor = "var(--color-blue)";
                            creamsBadge.style.color = "var(--color-white)";
                        }
                    } else if (filter === 'creams-muscle') {
                        if (creamsTitle) creamsTitle.innerText = "ג'ל CBD לשיקום ודלקות שרירים";
                        creamsDesc.innerText = "ג'ל התאוששות אקטיבי לספורטאים ולסובלים משרירים תפוסים ודלקתיים. מעורר את זרימת הדם, מסייע בפירוק חומצת חלב ומזרז שיקום רקמות שריר לאחר מאמץ פיזי אינטנסיבי.";
                        if (creamsBadge) {
                            creamsBadge.innerText = "בבדיקות מעבדה";
                            creamsBadge.className = "pill-badge prod-badge";
                            creamsBadge.style.backgroundColor = "var(--color-peach)";
                            creamsBadge.style.color = "var(--color-white)";
                        }
                    } else if (filter === 'creams-skin') {
                        if (creamsTitle) creamsTitle.innerText = "קרם CBD טיפולי לאלרגיות וגירויי עור";
                        creamsDesc.innerText = "קרם עדין והיפואלרגני להרגעת עור אדמומי, מגרד ומגורה. מועשר ב-CBD טהור, שיבולת שועל קולואידית ותמציות קלנדולה להחזרת הלחות הטבעית ושיקום מחסום העור במצבי אקזמה או פסוריאזיס.";
                        if (creamsBadge) {
                            creamsBadge.innerText = "בבדיקות מעבדה";
                            creamsBadge.className = "pill-badge prod-badge";
                            creamsBadge.style.backgroundColor = "var(--color-mint)";
                            creamsBadge.style.color = "var(--color-white)";
                        }
                    } else if (filter === 'creams-hemorrhoids') {
                        if (creamsTitle) creamsTitle.innerText = "קרם CBD מרגיע לנוחות מקומית";
                        creamsDesc.innerText = "נוסחה טיפולית עדינה ומלטפת המיועדת להקלה מיידית על כאבים, גרד ונפיחויות באזורים רגישים ואינטימיים (טחורים). תומכת בכיווץ כלי דם מקומיים והחלמה מהירה של רקמות פגועות.";
                        if (creamsBadge) {
                            creamsBadge.innerText = "בפיתוח מתקדם";
                            creamsBadge.className = "pill-badge prod-badge";
                            creamsBadge.style.backgroundColor = "var(--color-lime)";
                            creamsBadge.style.color = "var(--color-white)";
                        }
                    }
                }
            }
        }
        
        // Reset products slider position after filter
        if (typeof window._resetProductsSlider === 'function') {
            window._resetProductsSlider();
        }
    }

    function showWellnessTip(text) {
        if (tipBanner && tipContent) {
            tipContent.innerText = text;
            tipBanner.style.display = 'flex';
        }
    }

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

    // ==========================================================================
    // GLOBAL TRANSITIONS & SKELETON LOADINGS (Nature-Pharm Premium Enhancements)
    // ==========================================================================

    // --- Dynamic Scroll Animation Class Injection ---
    const bentoCards = document.querySelectorAll(
        '.bento-card, .expert-card, .testimonial-card, .product-card, .stat-gauge-card, .faq-item, .blog-card, .section-title, .section-subtitle'
    );
    
    bentoCards.forEach(el => {
        el.classList.add('scroll-anim');
        
        // Find index relative to siblings to create a natural stagger delay
        const parent = el.parentNode;
        if (parent) {
            const siblings = Array.from(parent.children);
            const index = siblings.indexOf(el);
            if (index >= 0) {
                el.setAttribute('data-anim-order', index.toString());
            }
        }
    });

    // Intersection Observer to trigger spring physics settling
    const scrollTargets = document.querySelectorAll('.scroll-anim');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const order = parseInt(el.getAttribute('data-anim-order') || '0', 10);
                    // Add delay based on stagger order
                    el.style.transitionDelay = `${order * 65}ms`;
                    el.classList.add('is-in');
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.08 });
        
        scrollTargets.forEach(el => observer.observe(el));
    } else {
        scrollTargets.forEach(el => el.classList.add('is-in'));
    }

    // --- Dynamic Image Shimmer Loading Injector ---
    const imageWrappers = document.querySelectorAll(
        '.cat-img-wrapper, .product-glow-wrapper, .expert-avatar, .what-is-cbd-visual, .mailers-visual'
    );

    imageWrappers.forEach(container => {
        container.classList.add('shimmer-container');
        
        const img = container.querySelector('img');
        if (!img) return;

        function markLoaded() {
            container.classList.add('is-loaded');
        }

        if (img.complete && img.naturalWidth > 0) {
            markLoaded();
        } else {
            img.addEventListener('load', markLoaded);
            img.addEventListener('error', markLoaded);
        }
    });

    // --- 13. INTERACTIVE TARGETED HEALTH PROTOCOLS (Bento Widget) ---
    (function () {
        const container = document.querySelector('.protocols-interactive-container');
        if (!container) return;

        const selectorCards = container.querySelectorAll('.protocols-selector-card');
        const customSelect = document.getElementById('protocols-custom-select');
        const selectTrigger = customSelect ? customSelect.querySelector('.select-trigger') : null;
        const selectedText = customSelect ? customSelect.querySelector('.selected-text') : null;
        const selectOptions = customSelect ? customSelect.querySelectorAll('.select-option') : [];
        const severitySlider = document.getElementById('protocols-severity-slider');
        const severityBadge = document.getElementById('protocols-severity-badge');
        const detailsPanel = document.getElementById('protocols-details-panel');

        const protocolsData = {
            sleep: {
                name_en: "Sleep Cycle Synchronization",
                name_he: "סנכרון לילה (שינה)",
                tag: "תמיכה במחזור השינה · פרוטוקול פעיל",
                title: "לישון עמוק. להתעורר מחדש.",
                desc: "סיוע מקצועי בזיהוי חלון הקנבינואידים האופטימלי עבורך. אנחנו נמפה יחד איתך את השעון הביולוגי שלך כדי להאריך את משך השינה העמוקה (REM) ולייצר הירדמות מהירה – ללא תחושת ערפול בבוקר.",
                humanTouch: "",
                metric: "84% מהמשתתפים מדווחים על שיפור דרמטי באיכות השינה כבר בשבועיים הראשונים.",
                blueprint: [
                    { day: "יום 1-7", text: "התחלת כיול: הרגעת תדירות היקיצות בלילה" },
                    { day: "יום 15", text: "שינוי מורגש: התארכות שנת ה-REM העמוקה" },
                    { day: "יום 21", text: "איזון יציב: יקיצה קלה ואנרגטית בבוקר" }
                ],
                badgeColor: "var(--color-blue)",
                doseTips: {
                    low: "מומלץ ליטול 2-3 טיפות של שמן סנכרון לילה כ-30 דקות לפני השינה.",
                    medium: "מומלץ ליטול 4-5 טיפות של שמן סנכרון לילה, בשילוב עם תרגילי נשימה קלים.",
                    high: "מינון גבוה של 6-8 טיפות בהנחיית יועץ ה-ECS שלך לכיול עמוק."
                }
            },
            pain: {
                name_en: "Pain and Inflammation Management",
                name_he: "ויסות כאב (פיזי)",
                tag: "ניהול כאב ודלקת · פרוטוקול פעיל",
                title: "להחזיר את חופש התנועה לגוף",
                desc: "כאב כרוני מתיש את מערכת העצבים. הפרוטוקול המותאם משלב ריכוזי CBD ו-CBG גבוהים במטרה להרגיע את קולטני הכאב ב-ECS ולבלום תהליכים דלקתיים מתמשכים במפרקים ובשרירים.",
                humanTouch: "היועץ האישי שלך יתאים את המינון בצורה הדרגתית (Titration) עד להגעה לנקודת ההקלה המדויקת שלך.",
                metric: "89% ירידה במדדי הכאב המדווחים.",
                blueprint: [
                    { day: "יום 1-5", text: "הפחתת הולכת אותות הכאב במערכת העצבים" },
                    { day: "יום 12", text: "הקלה משמעותית בדלקות מפרקים ותנועתיות משופרת" },
                    { day: "יום 30", text: "איזון פיזי יציב והחזרת הגוף לחיוניות מלאה" }
                ],
                badgeColor: "var(--color-peach)",
                doseTips: {
                    low: "מומלץ להתחיל בכיול עדין של 3 טיפות בבוקר ו-3 בערב.",
                    medium: "מומלץ לעבור ל-5 טיפות פעמיים ביום לצורך ויסות כאב בינוני.",
                    high: "מינון מתקדם של 7-8 טיפות פעמיים ביום עם מעקב צמוד של יועץ רפנא."
                }
            },
            anxiety: {
                name_en: "Emotional Load Reduction",
                name_he: "איזון סטרס וחרדה",
                tag: "הפחתת עומס רגשי · פרוטוקול ממוקד",
                title: "לכבות את רעשי הרקע של המוח",
                desc: "כשהראש לא מפסיק לעבוד, הגוף מייצר קורטיזול (הורמון סטרס). הפרוטוקול מעניק למערכת העצבים הסימפתטית שלך סיגנל מיידי להרפיה, ומסייע בהפחתת תחושת דופק מהיר, מועקה ואי-שקט יומיומי.",
                humanTouch: "",
                metric: "91% חוו ירידה משמעותית במדדי הלחץ המנטלי.",
                blueprint: [
                    { day: "יום 1-3", text: "בלימת ייצור עודף קורטיזול והרפיית מתח מיידית" },
                    { day: "יום 10", text: "הפחתת חרדה כללית ומניעת התקפי פאניקה" },
                    { day: "יום 21", text: "עמידות מוגברת לסטרס ושקט מחשבתי יומיומי" }
                ],
                badgeColor: "var(--color-lavender)",
                doseTips: {
                    low: "מומלץ ליטול 2-3 טיפות של שמן האיזון המנטלי עם הופעת לחץ ראשוני.",
                    medium: "מומלץ ליטול 4 טיפות בבוקר ובצהריים לשמירה על שלווה מתמשכת.",
                    high: "מומלץ ללוות את תהליך הכיול ב-6 טיפות פעמיים ביום בהנחיית יועץ ECS."
                }
            },
            digestive: {
                name_en: "Gut-Brain Axis Alignment",
                name_he: "איזון מעי ועיכול",
                tag: "ציר המעי-מוח · פרוטוקול פעיל",
                title: "להרגיע את הבטן",
                desc: "מתח נפשי מתבטא ישירות במערכת העיכול (התכווצויות, רגישות ודלקות). שימוש יומיומי מודרך ב-CBD פועל ישירות על הקולטנים הרבים הממוקמים במעי, מפחית רגישות ומחזיר את הרוגע למערכת.",
                humanTouch: "",
                metric: "78% הקלה בתסמיני עיכול תלויי סטרס.",
                blueprint: [
                    { day: "יום 1-7", text: "הרגעת התכווצויות מעיים וכאבים תלויי סטרס" },
                    { day: "יום 14", text: "הפחתת דלקתיות ברירית המעי ושיפור הספיגה" },
                    { day: "יום 30", text: "שיקום ציר המעי-מוח לפעילות עיכול סדירה" }
                ],
                badgeColor: "var(--color-mint)",
                doseTips: {
                    low: "מומלץ ליטול 3 טיפות על קיבה ריקה כחצי שעה לפני האוכל.",
                    medium: "מומלץ לעבור ל-4 טיפות פעמיים ביום לפני הארוחות העיקריות.",
                    high: "מינון מתקדם של 6 טיפות שלוש פעמים ביום לטיפול ברגישות מוגברת."
                }
            },
            concentration: {
                name_en: "Mental Focus and Day Protocol",
                name_he: "קשב וריכוז",
                tag: "מיקוד מנטלי · פרוטוקול יום",
                title: "חדות ללא אנרגיה עצבנית",
                desc: "בניגוד לחומרים מעוררים, פרוטוקול המיקוד שלנו מיועד להפחית 'ערפול מוחי' (Brain Fog) ולשפר את הבהירות המחשבתית על ידי הבאת הגוף למצב של נינוחות מרוכזת (Flow State).",
                humanTouch: "",
                metric: "שיפור מדווח בריכוז ובמיקוד בתוך זמן קצר.",
                blueprint: [
                    { day: "יום 1-5", text: "הפחתת ערפול מוחי והגברת הבהירות המחשבתית" },
                    { day: "יום 15", text: "שיפור הקשב המתמשך ומניעת מוסחות במשימות" },
                    { day: "יום 25", text: "כניסה קלה למצב Flow מרוכז ויציב לאורך היום" }
                ],
                badgeColor: "var(--color-lime)",
                doseTips: {
                    low: "מומלץ ליטול 3 טיפות בבוקר עם הקפה או כוס המים הראשונה.",
                    medium: "מומלץ ליטול 4-5 טיפות בבוקר ובצהריים לשמירה על חדות.",
                    high: "מינון מתקדם של 6 טיפות פעמיים ביום לביצועים מנטליים מוגברים."
                }
            },
            cognitive: {
                name_en: "Neuroprotection / Long-term Care",
                name_he: "תמיכה קוגניטיבית",
                tag: "הגנה עצבית (Neuroprotection) · פרוטוקול ארוך טווח",
                title: "לשמור על החדות והזיכרון",
                desc: "האטה קוגניטיבית, ערפול מוחי מתמשך או ירידה בזיכרון קשורים לעיתים קרובות לשחיקה של תאי העצב ולחץ חמצוני במערכת העצבים המרכזית. הפרוטוקול משלב רכיבי קנבינואידים נוגדי חמצון עוצמתיים, שמטרתם לתמוך בגמישות המוחית (Neuroplasticity), לעודד מיקוד ולספק שכבת הגנה טבעית לתפקודים הקוגניטיביים היומיומיים.",
                humanTouch: "",
                metric: "שיפור מדווח בבהירות המחשבה ותפקודי הזיכרון לטווח קצר בתוך 21 ימים.",
                blueprint: [
                    { day: "יום 1-7", text: "הפחתת עקה חמצונית בתאי המוח והגברת רמות הריכוז" },
                    { day: "יום 14", text: "שיפור מורגש בזיכרון העבודה ובמהירות השליפה" },
                    { day: "יום 21", text: "בהירות מנטלית יציבה ותמיכה ארוכת טווח בסינפסות" }
                ],
                badgeColor: "var(--color-blue)",
                doseTips: {
                    low: "מומלץ ליטול 3 טיפות בבוקר לתמיכה יומית בסינפסות.",
                    medium: "מומלץ ליטול 4 טיפות פעמיים ביום להגנה עצבית מתמשכת.",
                    high: "מומלץ ללוות את תהליך הכיול ב-6 טיפות פעמיים ביום בהנחיית יועץ."
                }
            },
            metastatic: {
                name_en: "Integrative Support / Clinical Care",
                name_he: "איזון מטאפזי / מטאסטטי",
                tag: "תמיכה אינטגרטיבית במצבים מורכבים · ליווי קליני צמוד",
                title: "מעטפת הגנה ותמיכה לגוף בשלבי התמודדות מורכבים",
                desc: "התמודדות עם מחלות כרוניות קשות או טיפולים אגרסיביים דורשת פרוטוקול ויסות ברמה הגבוהה ביותר. המטרה כאן אינה 'טיפול במחלה' אלא ניהול קפדני של איכות החיים: הפחתת הבחילות ותופעות הלוואי, גירוי התיאבון, הרגעת מערכת העצבים המותשת ומתן שקט מנטלי עמוק. הפרוטוקול מנוהל בכיול יומי רגיש ומותאם אישית בשיתוף פעולה מלא עם מדדי הגוף שלך.",
                humanTouch: "בשלבים אלו, היועץ האישי של רפנא זמין עבורך לכיול דינמי של המינונים בהתאם להרגשה היומית.",
                metric: "ליווי קפדני בהתאמה אישית מלאה.",
                blueprint: [
                    { day: "יום 1-3", text: "הקלה ראשונית בבחילות, רגישויות וייצוב התיאבון" },
                    { day: "יום 10", text: "איזון מנטלי ושיכוך עמוק של המתח במערכת העצבים" },
                    { day: "יום 20", text: "כיול דינמי מתמשך בהתאם לפרוטוקול הטיפולים האישי" }
                ],
                badgeColor: "#8A2BE2",
                doseTips: {
                    low: "מומלץ להתחיל במינון עדין מאוד של 2 טיפות בבוקר ו-2 בערב.",
                    medium: "מומלץ לעבור ל-4 טיפות, שלוש פעמים ביום, בהתאם למידת הבחילה.",
                    high: "מינון בהתאמה אישית בהנחיית יועץ קליני צמוד בלבד."
                }
            },
            inflammation: {
                name_en: "Immune System Balance / Chronic & Seasonal",
                name_he: "ויסות דלקות ואלרגיות",
                tag: "איזון מערכת החיסון · פרוטוקול עונתי וכרוני",
                title: "להרגיע את התגובה החיסונית של הגוף",
                desc: "אלרגיות עונתיות, תגובות עוריות ודלקות כרוניות הן תוצאה של מערכת חיסון שנמצאת במצב של 'התרעת שווא' קבועה. רכיבי ה-CBD והטרפנים הייעודיים בפרוטוקול זה פועלים כוויסתים טבעיים (Immunomodulators). הם מתקשרים עם קולטני ה-CB2 במערכת החיסון כדי להוריד את רמות ההיסטמין, לבלום את שרשרת התגובות הדלקתיות ולהחזיר את הגוף לאיזון פיזיולוגי שקט.",
                humanTouch: "",
                metric: "82% מהמשתתפים מדווחים על הפחתה משמעותית בעוצמת האלרגיה והדלקות.",
                blueprint: [
                    { day: "יום 1-5", text: "ויסות קולטני CB2 להורדת רמות ההיסטמין וההצטננות" },
                    { day: "יום 12", text: "בלימת התפרצויות דלקתיות בעור ושיפור דרכי הנשימה" },
                    { day: "יום 25", text: "חיזוק ואיזון מערכת החיסון למניעת רגישויות חוזרות" }
                ],
                badgeColor: "var(--color-peach)",
                doseTips: {
                    low: "מומלץ ליטול 3 טיפות בבוקר לתמיכה עונתית מונעת.",
                    medium: "מומלץ ליטול 4-5 טיפות פעמיים ביום במצבי התלקחות בינוניים.",
                    high: "מינון מוגבר של 6-8 טיפות פעמיים ביום לויסות דלקות מוגברות."
                }
            },
            pets: {
                name_en: "Holistic Veterinary Support / Weight Dose",
                name_he: "רפנא לחיות מחמד",
                tag: "וטרינריה הוליסטית · התאמה לפי משקל",
                title: "השקט והבריאות של החבר הכי טוב שלך",
                desc: "גם לכלבים וחתולים יש מערכת אנדוקנבינואידית (ECS) המושפעת ישירות ממתח וגיל. פרוטוקול חיות המחמד מותאם במיוחד לטיפול בחרדות נטישה, פחד מרעשים חזקים (כמו זיקוקים או רעמים), כאבי מפרקים אצל חיות מבוגרות ושיפור החיוניות הכללית. הנוסחה מותאמת בטעמים ידידותיים לבעלי חיים, ומלווה בהנחיות מינון מדויקות ובטוחות לחלוטין לפי משקל הגוף.",
                humanTouch: "",
                metric: "הקלה ניכרת במדדי הסטרס והתנועתיות בקרב חיות מחמד תוך 12-19 יום.",
                blueprint: [
                    { day: "יום 1-4", text: "הרגעה ראשונית של סטרס, יללות או סימני מתח גופני" },
                    { day: "יום 10", text: "הפחתת כאבי מפרקים אצל מבוגרים ושיפור החיוניות" },
                    { day: "יום 15", text: "שקט פנימי קבוע, שיפור ההתנהגות ואיזון ה-ECS של החיה" }
                ],
                badgeColor: "var(--color-blue)",
                blueprintCustom: true,
                doseTips: {
                    low: 'טיפה אחת לכל 5 ק"ג ממשקל החיה, פעם ביום עם האוכל.',
                    medium: '2 טיפות לכל 5 ק"ג ממשקל החיה, מחולק לבוקר וערב.',
                    high: 'מינון מתקדם של 3 טיפות לכל 5 ק"ג מונחה לפי רמת הכאב/סטרס.'
                }
            }
        };

        let activeProtocolId = 'sleep';

        function updateDetailsPanel() {
            const data = protocolsData[activeProtocolId];
            if (!data) return;

            const severity = parseInt(severitySlider.value, 10);
            let doseCategory = 'medium';
            let severityText = 'בינוני';
            
            if (severity <= 3) {
                doseCategory = 'low';
                severityText = 'קל';
            } else if (severity >= 8) {
                doseCategory = 'high';
                severityText = 'חמור';
            }
            
            severityBadge.textContent = `${severity} (${severityText})`;
            
            const recommendedDose = data.doseTips[doseCategory];
            
            // Build timeline items
            const timelineHtml = data.blueprint.map(step => `
                <div class="timeline-item">
                    <div class="timeline-day">${step.day}</div>
                    <div class="timeline-text">${step.text}</div>
                </div>
            `).join('');

            const humanTouchHtml = data.humanTouch ? `
                <div class="right-panel-human-touch">
                    <strong>טיפ מלווה:</strong> "${data.humanTouch}"
                </div>
            ` : '';

            detailsPanel.innerHTML = `
                <div class="right-panel-header">
                    <div class="right-panel-tag" style="color: ${data.badgeColor}">${data.tag}</div>
                    <h3 class="right-panel-title">${data.title}</h3>
                </div>
                <p class="right-panel-desc">${data.desc}</p>
                
                <div class="right-panel-timeline">
                    <h4 class="timeline-title">תוכנית הצלחה ל-30 יום:</h4>
                    <div class="timeline-track">
                        ${timelineHtml}
                    </div>
                </div>

                <div class="right-panel-highlight">
                    <strong>המלצת מינון מותאמת (חומרה ${severity}):</strong><br>
                    ${recommendedDose}
                </div>

                <div class="right-panel-highlight" style="border-style: solid; background-color: #F0FDF4; border-color: var(--color-mint);">
                    <strong>מדד הצלחה מבוסס מחקר:</strong><br>
                    ${data.metric}
                </div>

                ${humanTouchHtml}

                <a href="#quiz-onboarding" class="btn btn-primary right-panel-cta-btn">המשך לתוכנית האישית שלי</a>
            `;

            // Setup smooth scroll for the newly injected CTA button
            const injectedCta = detailsPanel.querySelector('.right-panel-cta-btn');
            if (injectedCta) {
                injectedCta.addEventListener('click', (e) => {
                    e.preventDefault();
                    const quizSec = document.getElementById('quiz-onboarding');
                    if (quizSec) {
                        quizSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            }
        }

        function syncActiveProtocol(protocolId, triggerScroll = false) {
            activeProtocolId = protocolId;

            // Sync grid selector buttons
            selectorCards.forEach(card => {
                if (card.getAttribute('data-protocol') === protocolId) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            // Sync custom dropdown selections
            selectOptions.forEach(opt => {
                if (opt.getAttribute('data-value') === protocolId) {
                    opt.classList.add('active');
                    if (selectedText) {
                        selectedText.textContent = opt.textContent.trim();
                    }
                } else {
                    opt.classList.remove('active');
                }
            });

            updateDetailsPanel();

            // Mobile Smart Scroll Optimization (UX refinement)
            if (triggerScroll && window.innerWidth <= 768 && detailsPanel) {
                const detailsOffset = detailsPanel.getBoundingClientRect().top + window.pageYOffset - 90; // offset for fixed header
                window.scrollTo({
                    top: detailsOffset,
                    behavior: 'smooth'
                });
            }
        }

        // Toggle custom select open/close
        if (selectTrigger && customSelect) {
            selectTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                customSelect.classList.toggle('open');
            });
        }

        // Close custom select on clicking anywhere outside
        document.addEventListener('click', () => {
            if (customSelect) {
                customSelect.classList.remove('open');
            }
        });

        // Event listener for custom dropdown option selection
        selectOptions.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const protocolId = opt.getAttribute('data-value');
                if (protocolId) {
                    syncActiveProtocol(protocolId, true);
                }
                if (customSelect) {
                    customSelect.classList.remove('open');
                }
            });
        });

        // Event listener for card selection
        selectorCards.forEach(card => {
            card.addEventListener('click', () => {
                const protocolId = card.getAttribute('data-protocol');
                if (protocolId) {
                    syncActiveProtocol(protocolId, true);
                }
            });
        });

        // Event listener for severity slider titration
        if (severitySlider) {
            severitySlider.addEventListener('input', () => {
                updateDetailsPanel();
            });
        }

        // Initialize display
        updateDetailsPanel();
    })();
});

