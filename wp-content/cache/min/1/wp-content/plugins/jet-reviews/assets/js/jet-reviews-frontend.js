(function($, publicConfig) {
    'use strict';
    let JetReviews = {
        eventBus: new Vue(),
        initedInstance: [],
        captchaToken: !1,
        init: function() {
            JetReviews.defineVueComponents();
            this.initInstances();
            window.addEventListener('jetReviews/editor/templateRenderer/renderSuccess', (event) => {
                this.initBlockInstances()
            }, !1)
        },
        initInstances: function() {
            let instancesList = $('.jet-reviews-advanced');
            if (!instancesList[0]) {
                return !1
            }
            instancesList.each(function() {
                let $target = $(this),
                    instanceId = $target.attr('id'),
                    uniqid = $target.data('uniqid') || !1,
                    options = window['jetReviewsWidget' + uniqid] || !1;
                if (!options) {
                    let optionsScript = document.getElementById('jetReviewsWidgetOptions' + uniqid);
                    if (optionsScript) {
                        eval(optionsScript.innerHTML);
                        options = window['jetReviewsWidget' + uniqid] || !1
                    }
                }
                if (!$target[0] || !uniqid || !options) {
                    return
                }
                window.JetReviews.createJetReviewAdvancedInstance(instanceId, options)
            })
        },
        initBlockInstances: function() {
            const targetNode = document.querySelector('.jet-reviews-block-holder');
            if (!targetNode) return;
            const observer = new MutationObserver(function(mutationsList, observer) {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        const event = new Event('jetReviews/editor/block/renderSuccess');
                        document.dispatchEvent(event);
                        observer.disconnect()
                    }
                }
            });
            observer.observe(targetNode, {
                childList: !0,
                subtree: !0
            });
            document.addEventListener('jetReviews/editor/block/renderSuccess', (event) => {
                this.initInstances()
            })
        },
        defineVueComponents: function() {
            Vue.component('jet-reviews-widget-pagination', {
                template: '#jet-reviews-widget-pagination-template',
                props: {
                    current: {
                        type: Number,
                        default: 1
                    },
                    total: {
                        type: Number,
                        default: 0
                    },
                    pageSize: {
                        type: Number,
                        default: 10
                    },
                    prevIcon: {
                        type: String,
                        default: '<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.67089 0L-5.96046e-08 6L5.67089 12L7 10.5938L2.65823 6L7 1.40625L5.67089 0Z"/></svg>'
                    },
                    nextIcon: {
                        type: String,
                        default: '<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.32911 0L7 6L1.32911 12L0 10.5938L4.34177 6L0 1.40625L1.32911 0Z"/></svg>'
                    },
                    customCss: {
                        type: String,
                        default: ''
                    },
                },
                data() {
                    return {
                        baseClass: 'jet-reviews-widget-pagination',
                        currentPage: this.current,
                        currentPageSize: this.pageSize
                    }
                },
                watch: {
                    total(val) {
                        let maxPage = Math.ceil(val / this.currentPageSize);
                        if (maxPage < this.currentPage) {
                            this.currentPage = (maxPage === 0 ? 1 : maxPage)
                        }
                    },
                    current(val) {
                        this.currentPage = val
                    },
                    pageSize(val) {
                        this.currentPageSize = val
                    }
                },
                computed: {
                    classesList() {
                        let classesList = [this.baseClass, ];
                        if (this.customCss) {
                            classesList.push(this.customCss)
                        }
                        return classesList
                    },
                    prevClasses() {
                        return [`${this.baseClass}__item`, `${this.baseClass}__item--prev`, {
                            [`${this.baseClass}__item--disabled`]: this.currentPage === 1 || !1
                        }]
                    },
                    nextClasses() {
                        return [`${this.baseClass}__item`, `${this.baseClass}__item--next`, {
                            [`${this.baseClass}__item--disabled`]: this.currentPage === this.allPages || !1
                        }]
                    },
                    firstPageClasses() {
                        return [`${this.baseClass}__item`, {
                            [`${this.baseClass}__item--active`]: this.currentPage === 1
                        }]
                    },
                    lastPageClasses() {
                        return [`${this.baseClass}__item`, {
                            [`${this.baseClass}__item--active`]: this.currentPage === this.allPages
                        }]
                    },
                    allPages() {
                        const allPage = Math.ceil(this.total / this.currentPageSize);
                        return (allPage === 0) ? 1 : allPage
                    },
                },
                methods: {
                    changePage(page) {
                        if (this.currentPage !== page) {
                            this.currentPage = page;
                            this.$emit('update:current', page);
                            this.$emit('on-change', page)
                        }
                    },
                    prev() {
                        const current = this.currentPage;
                        if (current <= 1) {
                            return !1
                        }
                        this.changePage(current - 1)
                    },
                    next() {
                        const current = this.currentPage;
                        if (current >= this.allPages) {
                            return !1
                        }
                        this.changePage(current + 1)
                    },
                    fastPrev() {
                        const page = this.currentPage - 5;
                        if (page > 0) {
                            this.changePage(page)
                        } else {
                            this.changePage(1)
                        }
                    },
                    fastNext() {
                        const page = this.currentPage + 5;
                        if (page > this.allPages) {
                            this.changePage(this.allPages)
                        } else {
                            this.changePage(page)
                        }
                    },
                },
            });
            Vue.component('jet-advanced-reviews-form', {
                template: '#jet-advanced-reviews-form-template',
                props: {
                    reviewFields: Array
                },
                data: function() {
                    return ({
                        reviewSubmiting: !1,
                        reviewTitle: '',
                        reviewContent: '',
                        reviewAuthorName: '',
                        reviewAuthorMail: '',
                        reviewMedia: [],
                        reviewMediaPreview: [],
                        messageText: '',
                        fields: this.reviewFields,
                        isValidUpload: !0,
                        trySend: !1
                    })
                },
                mounted: function() {
                    let self = this;
                    Vue.nextTick().then(function() {
                        let reviewContent = self.$refs.reviewContent,
                            textarea = reviewContent.$refs.textarea;
                        textarea.focus()
                    });
                    if (this.$root.isUserGuest) {
                        this.reviewAuthorName = JetReviews.getLocalStorageData('guestName', '');
                        this.reviewAuthorMail = JetReviews.getLocalStorageData('guestMail', '')
                    }
                },
                computed: {
                    formControlsVisible: function() {
                        if (this.$root.isUserGuest) {
                            return this.isValidReviewContent && this.isValidReviewTitle && this.isValidAuthorName && this.isValidAuthorEmail
                        }
                        return this.isValidReviewContent && this.isValidReviewTitle
                    },
                    formMessageVisible: function() {
                        return '' !== this.messageText
                    },
                    reviewTitleVisible: function() {
                        return this.$root.options.reviewTitleInputVisible
                    },
                    reviewContentVisible: function() {
                        return this.$root.options.reviewContentInputVisible
                    },
                    isValidReviewTitle: function() {
                        if (!this.trySend) {
                            return !0
                        }
                        return '' !== this.reviewTitle || !this.reviewTitleVisible
                    },
                    isValidReviewContent: function() {
                        if (!this.trySend) {
                            return !0
                        }
                        return '' !== this.reviewContent || !this.reviewContentVisible
                    },
                    isValidAuthorName: function() {
                        if (!this.trySend) {
                            return !0
                        }
                        return '' !== this.reviewAuthorName
                    },
                    isValidAuthorEmail: function() {
                        if (!this.trySend) {
                            return !0
                        }
                        return ('' !== this.reviewAuthorMail && JetReviews.checkValidEmail(this.reviewAuthorMail))
                    },
                    isValidMedia: function() {
                        return this.isValidUpload
                    }
                },
                methods: {
                    cancelSubmit: function() {
                        JetReviews.eventBus.$emit('closeNewReviewForm', {
                            uniqId: this.$root.options.uniqId
                        })
                    },
                    submitReview: function() {
                        this.trySend = !0;
                        if (!this.formControlsVisible) {
                            return !1
                        }
                        let self = this,
                            forSendingData = {
                                source: this.$root.sourceData.source,
                                source_type: this.$root.sourceData.sourceType,
                                source_id: this.$root.sourceData.sourceId,
                                title: this.reviewTitle,
                                content: this.reviewContent,
                                author_id: this.$root.userData.id,
                                author_name: this.reviewAuthorName,
                                author_mail: this.reviewAuthorMail,
                                rating_data: this.fields,
                                media: this.reviewMedia,
                            },
                            recaptchaConfig = window.jetReviewPublicConfig.recaptchaConfig;
                        if (recaptchaConfig.enable) {
                            window.grecaptcha.ready(function() {
                                grecaptcha.execute(recaptchaConfig.site_key, {
                                    action: 'submit_review'
                                }).then(function(token) {
                                    JetReviews.captchaToken = token;
                                    let modifyData = Object.assign({}, forSendingData, {
                                        captcha_token: token
                                    });
                                    self.submitReviewHandle(modifyData)
                                })
                            });
                            return !1
                        }
                        this.submitReviewHandle(forSendingData)
                    },
                    submitReviewHandle: function(sendData = !1) {
                        let self = this;
                        if (!sendData) {
                            console.warn('Empty new review data for sending');
                            return !1
                        }
                        const formData = new FormData();
                        formData.append('source', sendData.source);
                        formData.append('source_type', sendData.source_type);
                        formData.append('source_id', sendData.source_id);
                        formData.append('title', sendData.title);
                        formData.append('content', sendData.content);
                        formData.append('author_id', sendData.author_id);
                        formData.append('author_name', sendData.author_name);
                        formData.append('author_mail', sendData.author_mail);
                        formData.append('rating_data', JSON.stringify(sendData.rating_data || {}));
                        formData.append('captcha_token', sendData.captcha_token || '');
                        for (const file of sendData.media) {
                            formData.append('attached_media[]', file)
                        }
                        this.reviewSubmiting = !0;
                        this.messageText = '';
                        wp.apiFetch({
                            method: 'post',
                            path: window.jetReviewPublicConfig.submitReviewRoute,
                            body: formData,
                        }).then(function(response) {
                            response = self.maybeModifyResponce(response);
                            let responseSuccess = response.success,
                                responseData = response.data,
                                responseMessage = response.message;
                            self.reviewSubmiting = !1;
                            self.messageText = responseMessage;
                            if (self.$root.isUserGuest) {
                                let guestReviewedItems = JetReviews.getLocalStorageData(self.$root.guestReviewedStorageName, []);
                                if (responseSuccess && !guestReviewedItems.includes(self.$root.sourceData.sourceId)) {
                                    self.$root.userData.name = self.reviewAuthorName;
                                    self.$root.userData.mail = self.reviewAuthorMail;
                                    JetReviews.setLocalStorageData('guestName', self.reviewAuthorName);
                                    JetReviews.setLocalStorageData('guestMail', self.reviewAuthorMail);
                                    guestReviewedItems.push(self.$root.sourceData.sourceId);
                                    JetReviews.setLocalStorageData(self.$root.guestReviewedStorageName, guestReviewedItems)
                                }
                            }
                            if (responseSuccess) {
                                if ('review-created' === response.code) {
                                    JetReviews.eventBus.$emit('addReview', {
                                        uniqId: self.$root.options.uniqId,
                                        reviewData: responseData.item,
                                    });
                                    self.$root.reviewsAverageRating = +responseData.rating
                                }
                                self.$root.formVisible = !1;
                                self.$root.userData.canReview.allowed = !1;
                                self.$root.userData.canReview.message = responseMessage
                            }
                        })
                    },
                    maybeModifyResponce: function(responce = !1) {
                        let code = responce.code;
                        if ('need-approve' === code && '' !== this.$root.options.labels.moderatorCheckMessage) {
                            responce.message = this.$root.options.labels.moderatorCheckMessage
                        }
                        if ('already-created' === code && '' !== this.$root.options.labels.alreadyReviewedMessage) {
                            responce.message = this.$root.options.labels.alreadyReviewedMessage
                        }
                        return responce
                    },
                    handleFiles(files) {
                        this.reviewMedia = files
                    },
                    handleUploadStatus(payload) {
                        this.isValidUpload = payload
                    },
                    requiredFieldsCheck() {
                        return !0
                    }
                }
            });
            Vue.component('slider-input', {
                template: '#jet-advanced-reviews-slider-input-template',
                props: {
                    value: {
                        type: [String, Number],
                        default: ''
                    },
                    max: {
                        type: [Number],
                        default: 5
                    },
                    step: {
                        type: [Number],
                        default: 1
                    },
                    label: {
                        type: [String, Boolean],
                        default: !1
                    },
                },
                data: function() {
                    return ({})
                },
                computed: {
                    valueLabel: function() {
                        return this.value
                    }
                },
                methods: {
                    handleInput(event) {
                        let value = event.target.value;
                        this.$emit('input', value);
                        this.$emit('on-change', event)
                    },
                    handleChange(event) {
                        this.$emit('on-input-change', event)
                    }
                },
            });
            Vue.component('stars-input', {
                template: '#jet-advanced-reviews-stars-input-template',
                props: {
                    value: {
                        type: [String, Number],
                        default: ''
                    },
                    max: {
                        type: [Number],
                        default: 5
                    },
                    step: {
                        type: [Number],
                        default: 1
                    },
                    label: {
                        type: [String, Boolean],
                        default: !1
                    },
                },
                data: function() {
                    return ({
                        currentRating: this.value,
                    })
                },
                computed: {
                    valueLabel: function() {
                        return `${ this.value }/${ this.max }`
                    },
                    rating: function() {
                        return (this.currentRating / this.max) * 100
                    },
                    preparedRating: function() {
                        if (10 > this.rating) {
                            return 10
                        }
                        return this.rating
                    },
                    emptyIcon: function() {
                        return this.$root.refsHtml.emptyStarIcon || '<i class="far fa-star"></i>'
                    },
                    emptyIcons: function() {
                        let icon = `<div class="jet-reviews-star">${ this.$root.refsHtml.emptyStarIcon }</div>` || '<div class="jet-reviews-star"><i class="far fa-star"></i></div>';
                        return icon.repeat(this.max)
                    },
                    filledIcons: function() {
                        let icon = `<div class="jet-reviews-star">${ this.$root.refsHtml.filledStarIcon }</div>` || `<div class="jet-reviews-star"><i class="fas fa-star"></i></div>`;
                        return icon.repeat(this.max)
                    },
                    ratingClass: function() {
                        let ratingClass = 'very-high-rating';
                        if (this.rating >= 80 && this.rating <= 100) {
                            ratingClass = 'very-high-rating'
                        }
                        if (this.rating >= 60 && this.rating <= 79) {
                            ratingClass = 'high-rating'
                        }
                        if (this.rating >= 40 && this.rating <= 59) {
                            ratingClass = 'medium-rating'
                        }
                        if (this.rating >= 22 && this.rating <= 39) {
                            ratingClass = 'low-rating'
                        }
                        if (this.rating >= 0 && this.rating <= 21) {
                            ratingClass = 'very-low-rating'
                        }
                        return ratingClass
                    },
                },
                methods: {
                    ratingClick(rating) {
                        this.currentRating = rating;
                        this.$emit('input', rating)
                    },
                    ratingMouseOver(rating) {
                        this.currentRating = rating
                    },
                    ratingMouseOut() {
                        this.currentRating = this.value
                    },
                },
            });
            Vue.component('jet-advanced-reviews-item', {
                template: '#jet-advanced-reviews-item-template',
                props: {
                    itemData: Object
                },
                data: function() {
                    return ({
                        commentFormVisible: !1,
                        commentText: '',
                        commentAuthorName: '',
                        commentAuthorMail: '',
                        commentSubmiting: !1,
                        approvalSubmiting: !1,
                        parentComment: 0,
                        commentsVisible: !1,
                        responseMessage: '',
                        detailsVisibleState: !1
                    })
                },
                mounted: function() {
                    if (this.$root.isUserGuest) {
                        this.commentAuthorName = JetReviews.getLocalStorageData('guestName', '');
                        this.commentAuthorMail = JetReviews.getLocalStorageData('guestMail', '');
                        let guestReviewRatedData = JetReviews.getLocalStorageData(this.$root.guestRatedStorageName, {});
                        if (guestReviewRatedData.hasOwnProperty(this.itemData.id)) {
                            this.$set(this.itemData, 'approval', guestReviewRatedData[this.itemData.id])
                        }
                    }
                },
                computed: {
                    isDetailsFieldsAvaliable: function() {
                        return 1 < this.itemData.rating_data.length
                    },
                    detailsVisible: function() {
                        return this.isDetailsFieldsAvaliable && this.detailsVisibleState
                    },
                    averageRatingVisible: function() {
                        return 'average' === this.$root.options.reviewRatingType
                    },
                    detailsRatingVisible: function() {
                        return 'details' === this.$root.options.reviewRatingType
                    },
                    authorVerificationData: function() {
                        return 0 !== this.itemData.verifications.length ? this.itemData.verifications : !1
                    },
                    isCommentsEmpty: function() {
                        return 0 === this.itemData.comments.length
                    },
                    isCommentsVisible: function() {
                        return !this.isCommentsEmpty && this.commentsVisible
                    },
                    itemCommentsCount: function() {
                        let itemCommentsCount = !1;
                        itemCommentsCount = this.getCommentsCount(this.itemData.comments);
                        return itemCommentsCount
                    },
                    pinnedVisible: function() {
                        return this.itemData.pinned
                    },
                    commentControlsVisible: function() {
                        if (this.$root.isUserGuest) {
                            return this.isCommentValid && this.isValidAuthorName && this.isValidAuthorEmail
                        }
                        return this.isCommentValid
                    },
                    averageRatingData: function() {
                        let ratingDatalength = this.itemData.rating_data.length,
                            summaryValue = 0,
                            avarageValue = 0,
                            summaryMax = 0,
                            avarageMax = 0;
                        summaryValue = this.itemData.rating_data.reduce(function(accumulator, currentValue) {
                            return accumulator + +currentValue.field_value
                        }, 0);
                        summaryMax = this.itemData.rating_data.reduce(function(accumulator, currentValue) {
                            return accumulator + +currentValue.field_max
                        }, 0);
                        avarageValue = Math.round(summaryValue / ratingDatalength);
                        avarageMax = Math.round(summaryMax / ratingDatalength);
                        return {
                            rating: Math.round(avarageValue * 100 / avarageMax, 1),
                            max: Math.round(avarageMax, 1),
                            value: Math.round(avarageValue, 1)
                        }
                    },
                    addCommentIcon: function() {
                        return this.$root.refsHtml.newCommentButtonIcon || !1
                    },
                    showCommentsIcon: function() {
                        return this.$root.refsHtml.showCommentsButtonIcon || !1
                    },
                    pinnedIcon: function() {
                        return this.$root.refsHtml.pinnedIcon || '<i class="fas fa-thumbtack"></i>'
                    },
                    likeIcon: function() {
                        let emptyLike = this.$root.refsHtml.reviewEmptyLikeIcon || '<i class="far fa-thumbs-up"></i>',
                            filledLike = this.$root.refsHtml.reviewFilledLikeIcon || '<i class="fas fa-thumbs-up"></i>';
                        return !this.itemData.approval.like ? emptyLike : filledLike
                    },
                    dislikeIcon: function() {
                        let emptyDislike = this.$root.refsHtml.reviewEmptyDislikeIcon || '<i class="far fa-thumbs-down"></i>',
                            filledDislike = this.$root.refsHtml.reviewFilledDislikeIcon || '<i class="fas fa-thumbs-down"></i>';
                        return !this.itemData.approval.dislike ? emptyDislike : filledDislike
                    },
                    userCanComment: function() {
                        return this.$root.sourceData.commentsAllowed && this.$root.userData.canComment.allowed
                    },
                    userCanRate: function() {
                        return this.$root.sourceData.approvalAllowed && this.$root.userData.canRate
                    },
                    isValidAuthorName: function() {
                        return '' !== this.commentAuthorName
                    },
                    isValidAuthorEmail: function() {
                        return JetReviews.checkValidEmail(this.commentAuthorMail)
                    },
                    isCommentValid: function() {
                        return '' !== this.commentText
                    },
                    mediaList: function() {
                        if (0 === this.itemData.media.length) {
                            return !1
                        }
                        return this.itemData.media
                    }
                },
                methods: {
                    showCommentForm: function() {
                        let self = this;
                        this.commentFormVisible = !this.commentFormVisible;
                        if (this.commentFormVisible) {
                            Vue.nextTick().then(function() {
                                let commentContent = self.$refs.commentContent,
                                    textarea = commentContent.$refs.textarea;
                                textarea.focus()
                            })
                        }
                    },
                    cancelNewComment: function() {
                        this.commentFormVisible = !1;
                        this.responseMessage = ''
                    },
                    submitNewComment: function() {
                        let self = this,
                            forSendingData = {
                                source: this.$root.sourceData.source,
                                source_type: this.$root.sourceData.sourceType,
                                source_id: this.$root.sourceData.sourceId,
                                parent_id: this.parentComment,
                                review_id: this.itemData.id,
                                author_id: this.$root.userData.id,
                                author_name: this.commentAuthorName,
                                author_mail: this.commentAuthorMail,
                                content: this.commentText,
                            },
                            recaptchaConfig = window.jetReviewPublicConfig.recaptchaConfig;
                        if (recaptchaConfig.enable) {
                            window.grecaptcha.ready(function() {
                                grecaptcha.execute(recaptchaConfig.site_key, {
                                    action: 'submit_review_comment'
                                }).then(function(token) {
                                    JetReviews.captchaToken = token;
                                    let modifyData = Object.assign({}, forSendingData, {
                                        captcha_token: token
                                    });
                                    self.submitCommentHandler(modifyData)
                                })
                            });
                            return !1
                        }
                        this.submitCommentHandler(forSendingData)
                    },
                    submitCommentHandler: function(sendData = !1) {
                        let self = this;
                        if (!sendData) {
                            console.warn('Empty new comment data for sending');
                            return !1
                        }
                        this.commentSubmiting = !0;
                        wp.apiFetch({
                            method: 'post',
                            path: window.jetReviewPublicConfig.submitReviewCommentRoute,
                            data: sendData,
                        }).then(function(response) {
                            self.commentSubmiting = !1;
                            self.$root.userData.name = self.commentAuthorName;
                            self.$root.userData.mail = self.commentAuthorMail;
                            JetReviews.setLocalStorageData('guestName', self.commentAuthorName);
                            JetReviews.setLocalStorageData('guestMail', self.commentAuthorMail);
                            if (response.success) {
                                self.commentFormVisible = !1;
                                self.commentText = '';
                                self.itemData.comments.unshift(response.data);
                                self.commentsVisible = !0
                            } else {
                                self.responseMessage = response.message;
                                console.log(response.message)
                            }
                        })
                    },
                    updateApprovalHandler: function(type) {
                        let self = this,
                            altType = 'like' === type ? 'dislike' : 'like';
                        this.approvalSubmiting = !0;
                        wp.apiFetch({
                            method: 'post',
                            path: window.jetReviewPublicConfig.likeReviewRoute,
                            data: {
                                review_id: self.itemData.id,
                                type: type,
                                inc: !self.itemData.approval[type],
                                current_state: self.itemData.approval,
                            },
                        }).then(function(response) {
                            self.approvalSubmiting = !1;
                            if (response.success) {
                                self.$set(self.itemData, 'approval', response.data.approval);
                                self.$set(self.itemData, 'like', response.data.like);
                                self.$set(self.itemData, 'dislike', response.data.dislike);
                                if (self.$root.isUserGuest) {
                                    self.updateGuestApprovalData(self.itemData.id, self.itemData.approval)
                                }
                            } else {
                                console.log(response.message)
                            }
                        })
                    },
                    updateGuestApprovalData: function($reviewId = !1, rateData = !1) {
                        let guestReviewRateData = JetReviews.getLocalStorageData(this.$root.guestRatedStorageName, {});
                        guestReviewRateData[$reviewId] = rateData;
                        JetReviews.setLocalStorageData(this.$root.guestRatedStorageName, guestReviewRateData)
                    },
                    toggleCommentsVisible: function() {
                        this.commentsVisible = !this.commentsVisible
                    },
                    getCommentsCount: function(comments, initialValue = 0) {
                        let total = comments.reduce((accumulator, commentData) => {
                            if (commentData.hasOwnProperty('children') && 0 !== commentData.children.length) {
                                let initialValue = accumulator + 1;
                                return this.getCommentsCount(commentData.children, initialValue)
                            } else {
                                return accumulator + 1
                            }
                        }, initialValue);
                        return total
                    }
                }
            });
            Vue.component('jet-advanced-reviews-comment', {
                template: '#jet-advanced-reviews-comment-template',
                props: {
                    commentData: Object,
                    parentId: Number,
                    parentComments: Array,
                    depth: Number,
                },
                data: function() {
                    return ({
                        commentsList: this.commentData.children || [],
                        replySubmiting: !1,
                        replyFormVisible: !1,
                        replyText: '',
                        replyAuthorName: '',
                        replyAuthorMail: '',
                        responseMessage: ''
                    })
                },
                mounted: function() {
                    if (this.$root.isUserGuest) {
                        this.replyAuthorName = JetReviews.getLocalStorageData('guestName', '');
                        this.replyAuthorMail = JetReviews.getLocalStorageData('guestMail', '')
                    }
                },
                computed: {
                    commentClass: function() {
                        return ''
                    },
                    formControlsVisible: function() {
                        return this.$root.sourceData.commentsAllowed
                    },
                    submitVisible: function() {
                        if (this.$root.isUserGuest) {
                            return this.isReplyTextValid && this.isValidAuthorName && this.isValidAuthorEmail
                        }
                        return this.isReplyTextValid
                    },
                    replyIcon: function() {
                        return this.$root.refsHtml.replyButtonIcon || !1
                    },
                    isValidAuthorName: function() {
                        return '' !== this.replyAuthorName
                    },
                    isValidAuthorEmail: function() {
                        return JetReviews.checkValidEmail(this.replyAuthorMail)
                    },
                    isReplyTextValid: function() {
                        return '' !== this.replyText
                    },
                    authorVerificationData: function() {
                        if (!this.commentData.verifications) {
                            return !1
                        }
                        return 0 !== this.commentData.verifications.length ? this.commentData.verifications : !1
                    },
                },
                methods: {
                    showReplyForm: function() {
                        let self = this;
                        this.replyFormVisible = !this.replyFormVisible;
                        if (this.replyFormVisible) {
                            this.replyText = '<b>' + this.commentData.author.name + '</b>,&nbsp;';
                            Vue.nextTick().then(function() {
                                let commentText = self.$refs.commentText,
                                    textarea = commentText.$refs.textarea;
                                JetReviews.placeCaretAtEnd(textarea)
                            })
                        }
                    },
                    cancelNewReply: function() {
                        this.replyFormVisible = !1;
                        this.responseMessage = ''
                    },
                    submitNewReply: function() {
                        let self = this,
                            forSendingData = {
                                source: this.$root.sourceData.source,
                                source_type: this.$root.sourceData.sourceType,
                                source_id: this.$root.sourceData.sourceId,
                                parent_id: 0 === this.depth ? this.commentData.id : this.parentId,
                                review_id: this.commentData.review_id,
                                author_id: this.$root.userData.id,
                                author_name: this.replyAuthorName,
                                author_mail: this.replyAuthorMail,
                                content: this.replyText,
                            },
                            recaptchaConfig = window.jetReviewPublicConfig.recaptchaConfig;
                        if (recaptchaConfig.enable) {
                            window.grecaptcha.ready(function() {
                                grecaptcha.execute(recaptchaConfig.site_key, {
                                    action: 'submit_comment_reply'
                                }).then(function(token) {
                                    JetReviews.captchaToken = token;
                                    let modifyData = Object.assign({}, forSendingData, {
                                        captcha_token: token
                                    });
                                    self.submitReplyHandler(modifyData)
                                })
                            });
                            return !1
                        }
                        this.submitReplyHandler(forSendingData)
                    },
                    submitReplyHandler: function(sendData = !1) {
                        let self = this;
                        if (!sendData) {
                            console.warn('Empty review comment data for sending');
                            return !1
                        }
                        this.replySubmiting = !0;
                        wp.apiFetch({
                            method: 'post',
                            path: window.jetReviewPublicConfig.submitReviewCommentRoute,
                            data: sendData,
                        }).then(function(response) {
                            self.replySubmiting = !1;
                            self.$root.userData.name = self.replyAuthorName;
                            self.$root.userData.mail = self.replyAuthorMail;
                            JetReviews.setLocalStorageData('guestName', self.replyAuthorName);
                            JetReviews.setLocalStorageData('guestMail', self.replyAuthorMail);
                            if (response.success) {
                                self.replyFormVisible = !1;
                                self.replyText = '';
                                if (0 === self.depth) {
                                    self.commentData.children.unshift(response.data)
                                } else {
                                    self.parentComments.push(response.data)
                                }
                            } else {
                                self.responseMessage = response.message
                            }
                        })
                    }
                }
            });
            Vue.component('points-field', {
                template: '#jet-advanced-reviews-point-field-template',
                props: {
                    before: {
                        type: [Number, String, Boolean],
                        default: !1
                    },
                    rating: Number,
                    after: {
                        type: [Number, String, Boolean],
                        default: !1
                    },
                },
                data: function() {
                    return ({})
                },
                computed: {
                    isBeforeEmpty: function() {
                        return !1 === this.before || '' === this.before
                    },
                    isAfterEmpty: function() {
                        return !1 === this.after || '' === this.after
                    },
                    preparedRating: function() {
                        if (10 > this.rating) {
                            return 10
                        }
                        return this.rating
                    },
                    ratingClass: function() {
                        let ratingClass = 'very-high-rating';
                        if (this.rating >= 80 && this.rating <= 100) {
                            ratingClass = 'very-high-rating'
                        }
                        if (this.rating >= 60 && this.rating <= 79) {
                            ratingClass = 'high-rating'
                        }
                        if (this.rating >= 40 && this.rating <= 59) {
                            ratingClass = 'medium-rating'
                        }
                        if (this.rating >= 22 && this.rating <= 39) {
                            ratingClass = 'low-rating'
                        }
                        if (this.rating >= 0 && this.rating <= 21) {
                            ratingClass = 'very-low-rating'
                        }
                        return ratingClass
                    }
                }
            });
            Vue.component('stars-field', {
                template: '#jet-advanced-reviews-star-field-template',
                props: {
                    before: {
                        type: [Number, String, Boolean],
                        default: !1
                    },
                    rating: Number,
                    after: {
                        type: [Number, String, Boolean],
                        default: !1
                    },
                },
                data: function() {
                    return ({})
                },
                computed: {
                    isBeforeEmpty: function() {
                        return !this.before || '' === this.before
                    },
                    isAfterEmpty: function() {
                        return !this.after || '' === this.after
                    },
                    preparedRating: function() {
                        if (10 > this.rating) {
                            return 10
                        }
                        return this.rating
                    },
                    emptyIcons: function() {
                        let icon = `<div class="jet-reviews-star">${ this.$root.refsHtml.emptyStarIcon }</div>` || '<div class="jet-reviews-star"><i class="far fa-star"></i></div>';
                        return icon.repeat(5)
                    },
                    filledIcons: function() {
                        let icon = `<div class="jet-reviews-star">${ this.$root.refsHtml.filledStarIcon }</div>` || '<div class="jet-reviews-star"><i class="fas fa-star"></i></div>';
                        return icon.repeat(5)
                    },
                    ratingClass: function() {
                        let ratingClass = 'very-high-rating';
                        if (this.rating >= 80 && this.rating <= 100) {
                            ratingClass = 'very-high-rating'
                        }
                        if (this.rating >= 60 && this.rating <= 79) {
                            ratingClass = 'high-rating'
                        }
                        if (this.rating >= 40 && this.rating <= 59) {
                            ratingClass = 'medium-rating'
                        }
                        if (this.rating >= 22 && this.rating <= 39) {
                            ratingClass = 'low-rating'
                        }
                        if (this.rating >= 0 && this.rating <= 21) {
                            ratingClass = 'very-low-rating'
                        }
                        return ratingClass
                    }
                },
            });
            Vue.component('html-textarea', {
                template: '<div :class="classes" ref="textarea" contenteditable="true" tabindex="0" :data-placeholder="placeholder" :data-not-valid-label="notValidLabel" @input="updateHTML" @focus="focusHandler" @blur="blurHandler"></div>',
                props: {
                    value: String,
                    isValid: {
                        type: Boolean,
                        default: !0,
                    },
                    placeholder: {
                        type: String,
                        default: 'Input',
                    },
                    notValidLabel: {
                        type: String,
                        default: 'This field is required or not valid',
                    },
                },
                data: function() {
                    return ({
                        isFocus: !1,
                        isEmpty: !0,
                    })
                },
                computed: {
                    classes: function() {
                        let classes = ['jet-reviews-content-editable', !this.isValid ? 'jet-reviews-content-editable--not-valid' : !1, this.isFocus ? 'jet-reviews-content-editable--focus' : !1, this.isPlaceholder ? 'jet-reviews-content-editable--placeholder' : !1, ];
                        return classes
                    },
                    isPlaceholder: function() {
                        if (this.isFocus || !this.isEmpty) {
                            return !1
                        }
                        return !0
                    }
                },
                mounted: function() {
                    this.$el.innerHTML = this.value
                },
                methods: {
                    updateHTML: function(e) {
                        const html = e.target.innerHTML.trim();
                        if (html === '<br>' || html === '') {
                            this.isEmpty = !0;
                            this.$emit('input', '')
                        } else {
                            this.isEmpty = !1;
                            this.$emit('input', html)
                        }
                    },
                    focusHandler: function(e) {
                        this.$emit('focus', e.target);
                        this.isFocus = !0
                    },
                    blurHandler: function(e) {
                        this.$emit('blur', e.target);
                        this.isFocus = !1
                    }
                }
            });
            Vue.component('file-input', {
                template: '#jet-reviews-widget-file-input-template',
                props: {
                    allowedTypes: {
                        type: [Array],
                        default () {
                            return ['image/jpeg', 'image/png', 'image/gif']
                        }
                    },
                    maxFileSize: {
                        type: [Number],
                        default: 5
                    },
                    uploadIcon: {
                        type: [String],
                        default: ''
                    },
                    uploadControlLabel: {
                        type: [String],
                        default: 'Upload your file here'
                    },
                    buttonLabel: {
                        type: [String],
                        default: 'Choose File'
                    },
                    maxFileSizeLabel: {
                        type: [String],
                        default: 'Maximum size'
                    },
                },
                data: function() {
                    return ({
                        baseClass: 'jet-reviews-widget-file-input',
                        reviewMedia: [],
                        reviewMediaPreview: [],
                        messageText: '',
                        isDragOver: !1,
                    })
                },
                computed: {
                    classesList() {
                        let classesList = [this.baseClass, this.isDragOver ? 'is-dragover' : '', ];
                        return classesList
                    },
                    maxSizeLabel() {
                        return `${ this.maxFileSizeLabel }: ${ this.maxFileSize }MB`
                    },
                    isMessageVisible: function() {
                        return '' !== this.messageText
                    },
                    maxSize: function() {
                        return this.maxFileSize * 1024 * 1024
                    },
                },
                methods: {
                    triggerFileInput() {
                        this.$refs.fileInput.click()
                    },
                    handleFiles(event) {
                        const files = Array.from(event.target.files);
                        this.reviewMedia = [];
                        this.reviewMediaPreview = [];
                        this.messageText = '';
                        this.$emit('on-change', event);
                        this.$emit('on-send-status', !0);
                        files.forEach(file => {
                            if (!this.allowedTypes.includes(file.type)) {
                                this.$emit('on-send-status', !1);
                                this.messageText = 'Not allowed file type';
                                return
                            }
                            if (file.size > this.maxSize) {
                                this.$emit('on-send-status', !1);
                                this.messageText = 'Maximum file size exceeded';
                                return
                            }
                            this.reviewMedia.push(file);
                            const reader = new FileReader();
                            reader.onload = event => this.reviewMediaPreview.push(event.target.result);
                            reader.readAsDataURL(file)
                        });
                        this.$emit('on-file-change', this.reviewMedia)
                    },
                    onDragOver() {
                        this.isDragOver = !0
                    },
                    onDragLeave() {
                        this.isDragOver = !1
                    },
                    onFileDrop(event) {
                        this.isDragOver = !1;
                        const filesList = event ? .dataTransfer ? .files;
                        if (!filesList || filesList.length === 0) return;
                        const files = Array.from(filesList);
                        this.reviewMedia = [];
                        this.reviewMediaPreview = [];
                        this.messageText = '';
                        this.$emit('on-send-status', !0);
                        files.forEach(file => {
                            if (!this.allowedTypes.includes(file.type)) {
                                this.$emit('on-send-status', !1);
                                this.messageText = 'Not allowed file type';
                                return
                            };
                            if (file.size > this.maxSize) {
                                this.$emit('on-send-status', !1);
                                this.messageText = 'Maximum file size exceeded';
                                return
                            };
                            this.reviewMedia.push(file);
                            const reader = new FileReader();
                            reader.onload = event => this.reviewMediaPreview.push(event.target.result);
                            reader.readAsDataURL(file)
                        });
                        this.$emit('on-file-change', this.reviewMedia)
                    },
                },
            })
        },
        createJetReviewAdvancedInstance: function(instanceId, options) {
            if (JetReviews.initedInstance.includes(instanceId)) {
                return
            }
            JetReviews.initedInstance.push(instanceId);
            let JetReviewAdvancedInstance = new Vue({
                el: '#' + instanceId,
                data: {
                    uniqId: instanceId,
                    options: options,
                    reviewsLoaded: !1,
                    getReviewsProcessing: !1,
                    reviewsList: [],
                    reviewsPage: 1,
                    reviewsTotal: 0,
                    reviewsAverageRating: 0,
                    userData: options.userData,
                    sourceData: options.sourceData,
                    reviewTypeFields: options.reviewsFields,
                    formVisible: !1,
                    isMounted: !1,
                    refsHtml: {},
                },
                mounted: function() {
                    let self = this,
                        refsHtml = {};
                    this.isMounted = !0;
                    for (var ref in this.$refs) {
                        Object.assign(refsHtml, {
                            [ref]: this.$refs[ref].innerHTML
                        })
                    }
                    this.refsHtml = refsHtml;
                    if (this.isUserGuest) {
                        this.$set(this.userData, 'id', this.guestId);
                        this.$set(this.userData, 'name', this.guestName);
                        this.$set(this.userData, 'mail', this.guestMail);
                        let guestReviewedItems = JetReviews.getLocalStorageData(this.guestReviewedStorageName, []);
                        if (guestReviewedItems.includes(this.sourceData.sourceId)) {
                            this.$set(this.userData.canReview, 'allowed', !1);
                            this.$set(this.userData.canReview, 'message', this.options.labels.alreadyReviewedMessage)
                        }
                    }
                    if (this.options.reviewsListData) {
                        this.reviewsList = this.options.reviewsListData.list;
                        this.reviewsTotal = +this.options.reviewsListData.total;
                        this.reviewsAverageRating = +this.options.reviewsListData.rating;
                        this.reviewsLoaded = !0
                    } else {
                        wp.apiFetch({
                            method: 'post',
                            path: window.jetReviewPublicConfig.getPublicReviewsRoute,
                            data: {
                                source: self.sourceData.source,
                                source_id: self.sourceData.sourceId,
                                page: self.reviewsPage - 1,
                                page_size: self.options.pageSize
                            },
                        }).then(function(response) {
                            self.reviewsLoaded = !0;
                            if (response.success && response.data) {
                                self.reviewsList = response.data.list;
                                self.reviewsTotal = +response.data.total;
                                self.reviewsAverageRating = +response.data.rating
                            } else {
                                console.log('Error')
                            }
                        })
                    }
                    JetReviews.eventBus.$on('addReview', function(payLoad) {
                        if (self.options.uniqId !== payLoad.uniqId) {
                            return
                        }
                        self.formVisible = !1;
                        let reviewData = payLoad.reviewData;
                        self.reviewsList.unshift(reviewData);
                        self.reviewsTotal += 1
                    });
                    JetReviews.eventBus.$on('closeNewReviewForm', function(payLoad) {
                        if (self.options.uniqId !== payLoad.uniqId) {
                            return
                        }
                        self.formVisible = !1
                    })
                },
                computed: {
                    instanceClass: function() {
                        let classes = ['jet-reviews-advanced__instance', ];
                        if (this.isMounted) {
                            classes.push('is-mounted')
                        }
                        return classes
                    },
                    reviewsLength: function() {
                        return this.reviewsList.length
                    },
                    reviewsListEmpty: function() {
                        return 0 === this.reviewsList.length ? !0 : !1
                    },
                    preparedFields: function() {
                        let rawFields = this.reviewTypeFields,
                            preparedFields = [];
                        for (let fieldData of rawFields) {
                            preparedFields.push({
                                field_label: fieldData.label,
                                field_value: +fieldData.max,
                                field_step: +fieldData.step,
                                field_max: +fieldData.max,
                            })
                        }
                        return preparedFields
                    },
                    averageRating: function() {
                        let totalRating = 0;
                        if (this.reviewsListEmpty) {
                            return 0
                        }
                        totalRating = this.reviewsList.reduce(function(sum, reviewItem) {
                            return +reviewItem.rating + sum
                        }, 0);
                        return Math.round(totalRating / this.reviewsList.length, 1)
                    },
                    averageValue: function() {
                        let summaryValue = 0;
                        if (this.reviewsListEmpty) {
                            return 0
                        }
                        for (let reviewItem of this.reviewsList) {
                            let ratingData = reviewItem.rating_data,
                                itemSummary = 0;
                            for (let ratingItem of ratingData) {
                                itemSummary += +ratingItem.field_value
                            }
                            summaryValue += Math.round(itemSummary / ratingData.length, 1)
                        }
                        return Math.round(summaryValue / this.reviewsList.length, 1)
                    },
                    averageMax: function() {
                        let totalMax = 0,
                            fields = this.reviewTypeFields;
                        totalMax = fields.reduce(function(sum, field) {
                            return +field.max + sum
                        }, 0);
                        return Math.round(totalMax / fields.length, 1)
                    },
                    addReviewIcon: function() {
                        return this.refsHtml.newReviewButtonIcon || !1
                    },
                    isUserGuest: function() {
                        return this.userData.roles.includes('guest')
                    },
                    guestId: function() {
                        let guestId = JetReviews.getLocalStorageData('guestId', !1);
                        if (!guestId) {
                            let guestId = `guest_${ JetReviews.getUniqId() }`;
                            JetReviews.setLocalStorageData('guestId', guestId);
                            return guestId
                        }
                        return guestId
                    },
                    guestName: function() {
                        let guestName = JetReviews.getLocalStorageData('guestName', !1);
                        if (!guestName) {
                            JetReviews.setLocalStorageData('guestName', '');
                            return ''
                        }
                        return guestName
                    },
                    guestMail: function() {
                        let guestMail = JetReviews.getLocalStorageData('guestMail', !1);
                        if (!guestMail) {
                            JetReviews.setLocalStorageData('guestMail', '');
                            return ''
                        }
                        return guestMail
                    },
                    guestReviewedStorageName: function() {
                        return `reviewed${ JetReviews.capitalizeString( this.sourceData.source ) }Items`
                    },
                    guestRatedStorageName: function() {
                        return `rated${ JetReviews.capitalizeString( this.sourceData.source ) }Items`
                    },
                    guestNameFieldVisible: function() {
                        return this.isUserGuest && '' === this.userData.name
                    },
                    guestMailFieldVisible: function() {
                        return this.isUserGuest && '' === this.userData.mail
                    },
                    paginationVisible: function() {
                        return this.reviewsTotal > this.options.pageSize
                    },
                },
                methods: {
                    formVisibleToggle: function() {
                        this.formVisible = !this.formVisible
                    },
                    getLabelBySlug: function(slug = !1) {
                        if (!slug) {
                            return !1
                        }
                        if (!window.jetReviewPublicConfig.labels.hasOwnProperty(slug)) {
                            return !1
                        }
                        return window.jetReviewPublicConfig.labels[slug]
                    },
                    changePageHandle: function(page) {
                        this.reviewsPage = page;
                        this.getReviews()
                    },
                    getReviews: function() {
                        let self = this;
                        self.getReviewsProcessing = !0;
                        wp.apiFetch({
                            method: 'post',
                            path: window.jetReviewPublicConfig.getPublicReviewsRoute,
                            data: {
                                source: self.sourceData.source,
                                source_id: self.sourceData.sourceId,
                                page: self.reviewsPage - 1,
                                page_size: self.options.pageSize,
                            },
                        }).then(function(response) {
                            self.getReviewsProcessing = !1;
                            self.scrollToInstance();
                            if (response.success && response.data) {
                                self.reviewsList = response.data.list;
                                self.reviewsTotal = +response.data.total;
                                self.reviewsAverageRating = +response.data.rating
                            } else {
                                console.log('Error')
                            }
                        })
                    },
                    scrollToInstance: function() {
                        let $instance = $(`#${ this.uniqId }`),
                            offsetTop = $instance.offset().top - 50;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth',
                        })
                    }
                }
            })
        },
        getLocalStorageData: function(_key = !1, _default = !1) {
            try {
                let jetReviewsData = JSON.parse(window.localStorage.getItem('jetReviewsData'));
                if (_key) {
                    if (jetReviewsData.hasOwnProperty(_key)) {
                        return jetReviewsData[_key]
                    } else {
                        return _default
                    }
                }
                return jetReviewsData
            } catch (e) {
                return _default
            }
        },
        setLocalStorageData: function(key, data) {
            let jetReviewsData = this.getLocalStorageData() || {};
            jetReviewsData[key] = data;
            window.localStorage.setItem('jetReviewsData', JSON.stringify(jetReviewsData))
        },
        getUniqId: function() {
            return Math.random().toString(36).substr(2, 9)
        },
        capitalizeString: function(string = '') {
            if (typeof string !== 'string') {
                return ''
            }
            return string.charAt(0).toUpperCase() + string.slice(1)
        },
        placeCaretAtEnd: function(el) {
            el.focus();
            if ('undefined' !== typeof window.getSelection && 'undefined' !== typeof document.createRange) {
                let range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(!1);
                let selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range)
            } else if ('undefined' !== typeof document.body.createTextRange) {
                let textRange = document.body.createTextRange();
                textRange.moveToElementText(el);
                textRange.collapse(!1);
                textRange.select()
            }
        },
        checkValidEmail: function(email) {
            var reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return reg.test(email)
        },
    };
    window.JetReviews = JetReviews;
    JetReviews.init()
}(jQuery, window.jetReviewPublicConfig));
(function($, elementorFrontend, publicConfig) {
    'use strict';
    let JetReviewsElementor = {
        init: function() {
            var widgets = {
                'jet-reviews.default': JetReviewsElementor.widgetJetReviewsSimple,
                'jet-reviews-advanced.default': JetReviewsElementor.widgetJetReviewsAdvanced,
            };
            $.each(widgets, function(widget, callback) {
                elementorFrontend.hooks.addAction('frontend/element_ready/' + widget, callback)
            })
        },
        widgetJetReviewsSimple: function($scope) {
            var $target = $scope.find('.jet-review'),
                settings = $target.data('settings'),
                $form = $('.jet-review__form', $target),
                $submitButton = $('.jet-review__form-submit', $target),
                $removeButton = $('.jet-review__item-remove', $target),
                $message = $('.jet-review__form-message', $target),
                $rangeControl = $('.jet-review__form-field.type-range input', $target),
                ajaxRequest = null;
            $rangeControl.on('input', function(event) {
                var $this = $(this),
                    $parent = $this.closest('.jet-review__form-field'),
                    $currentValue = $('.current-value', $parent),
                    value = $this.val();
                $currentValue.html(value)
            });
            $submitButton.on('click.widgetJetReviews', function() {
                addReviewHandle();
                return !1
            });
            $removeButton.on('click.widgetJetReviews', function() {
                var $this = $(this);
                removeReviewHandle($this);
                return !1
            });

            function addReviewHandle() {
                var now = new Date(),
                    reviewTime = now.getTime(),
                    reviewDate = new Date(reviewTime).toLocaleString(),
                    sendData = {
                        'post_id': settings.post_id,
                        'review_time': reviewTime,
                        'review_date': reviewDate
                    },
                    serializeArray = $form.serializeObject();
                sendData = jQuery.extend(sendData, serializeArray);
                ajaxRequest = jQuery.ajax({
                    type: 'POST',
                    url: window.jetReviewPublicConfig.ajax_url,
                    data: {
                        'action': 'jet_reviews_add_meta_review',
                        'data': sendData
                    },
                    beforeSend: function(jqXHR, ajaxSettings) {
                        if (null !== ajaxRequest) {
                            ajaxRequest.abort()
                        }
                        $submitButton.addClass('load-state')
                    },
                    error: function(jqXHR, ajaxSettings) {},
                    success: function(data, textStatus, jqXHR) {
                        var responseType = data.type,
                            message = data.message || '';
                        if ('error' === responseType) {
                            $submitButton.removeClass('load-state');
                            $message.addClass('visible-state');
                            $('span', $message).html(message)
                        }
                        if ('success' === responseType) {
                            location.reload()
                        }
                    }
                })
            };

            function removeReviewHandle($removeButton) {
                var $reviewItem = $removeButton.closest('.jet-review__item'),
                    reviewUserId = $reviewItem.data('user-id'),
                    sendData = {
                        'post_id': settings.post_id,
                        'user_id': reviewUserId
                    };
                ajaxRequest = jQuery.ajax({
                    type: 'POST',
                    url: window.jetReviewPublicConfig.ajax_url,
                    data: {
                        'action': 'jet_reviews_remove_review',
                        'data': sendData
                    },
                    beforeSend: function(jqXHR, ajaxSettings) {
                        if (null !== ajaxRequest) {
                            ajaxRequest.abort()
                        }
                        $removeButton.addClass('load-state')
                    },
                    error: function(jqXHR, ajaxSettings) {},
                    success: function(data, textStatus, jqXHR) {
                        var successType = data.type,
                            message = data.message || '';
                        if ('error' == successType) {}
                        if ('success' == successType) {
                            location.reload()
                        }
                    }
                })
            }
        },
        widgetJetReviewsAdvanced: function($scope) {
            let $target = $scope.find('.jet-reviews-advanced'),
                instanceId = $target.attr('id'),
                uniqid = $target.data('uniqid') || !1,
                options = window['jetReviewsWidget' + uniqid] || {};
            if (!$target[0] || !uniqid) {
                return
            }
            window.JetReviews.createJetReviewAdvancedInstance(instanceId, options)
        },
    }
    $(window).on('elementor/frontend/init', JetReviewsElementor.init);
    $.fn.serializeObject = function() {
        var self = this,
            json = {},
            push_counters = {},
            patterns = {
                "validate": /^[a-zA-Z][a-zA-Z0-9_-]*(?:\[(?:\d*|[a-zA-Z0-9_-]+)\])*$/,
                "key": /[a-zA-Z0-9_-]+|(?=\[\])/g,
                "push": /^$/,
                "fixed": /^\d+$/,
                "named": /^[a-zA-Z0-9_-]+$/
            };
        this.build = function(base, key, value) {
            base[key] = value;
            return base
        };
        this.push_counter = function(key) {
            if (push_counters[key] === undefined) {
                push_counters[key] = 0
            }
            return push_counters[key]++
        };
        $.each($(this).serializeArray(), function() {
            if (!patterns.validate.test(this.name)) {
                return
            }
            var k, keys = this.name.match(patterns.key),
                merge = this.value,
                reverse_key = this.name;
            while ((k = keys.pop()) !== undefined) {
                reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');
                if (k.match(patterns.push)) {
                    merge = self.build([], self.push_counter(reverse_key), merge)
                } else if (k.match(patterns.fixed)) {
                    merge = self.build([], k, merge)
                } else if (k.match(patterns.named)) {
                    merge = self.build({}, k, merge)
                }
            }
            json = $.extend(!0, json, merge)
        });
        return json
    }
}(jQuery, window.elementorFrontend, window.jetReviewPublicConfig))