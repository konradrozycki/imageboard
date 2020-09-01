(function () {
    new Vue({
        el: "#main",
        data: {
            imageId: location.hash.slice(1),
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            lastImageId: [],
            lastImgId: "",
        },
        mounted: function () {
            var self = this;
            var lastId = this.lastImageId;
            axios
                .get("/images")
                .then(function (results) {
                    self.images = results.data;
                    console.log(results.data);
                    let lastImageId = self.images[self.images.length - 1].id;
                    lastId.push(lastImageId);
                    self.lastImgId = lastImageId;
                })
                .catch(function (error) {
                    console.log("error in axios: ", error);
                });

            window.addEventListener("hashchange", function () {
                console.log("hash change has changed");
                self.imageId = location.hash.slice(1);
            });
            this.scroll();
        },

        methods: {
            getId: function (imageId) {
                console.log("getting ID!!!!!: ", imageId);
                this.imageId = imageId;
            },
            closeModal: function () {
                console.log("received close from child and closed Modal!!!!");
                this.imageId = null;
                location.hash = "";
            },

            handleClick: function (e) {
                var self = this;

                e.preventDefault();
                console.log("this!: ", this);

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                axios
                    .post("/upload", formData)
                    .then(function (resp) {
                        console.log("response from POST /upload:", resp);
                        self.images.unshift(resp.data);
                    })
                    .catch(function (err) {
                        console.log("err in POST /upload", err);
                    });
                //clear the input after upload
                this.title = "";
                this.username = "";
                this.description = "";
                this.file.value = "";
            },
            handleChange: function (e) {
                console.log("handleChange is running");
                console.log("file ", e.target.files[0]);

                this.file = e.target.files[0];
            },

            scroll: function () {
                var self = this;
                window.onscroll = function () {
                    let bottomOfWindow =
                        Math.floor(document.documentElement.scrollTop) +
                            Math.floor(window.innerHeight) +
                            1 >
                        Math.floor(document.documentElement.offsetHeight) - 100;

                    if (bottomOfWindow) {
                        console.log("bottom of window");
                        axios
                            .get("/more-images/" + self.lastImgId)
                            .then(function (resp) {
                                console.log("resp :", resp);
                                resp.data.forEach(function (ele) {
                                    self.images.push(ele);
                                });
                                let lastImageId =
                                    self.images[self.images.length - 1].id;

                                self.lastImgId = lastImageId;
                                console.log("scrolling ");
                            })
                            .catch(function (err) {
                                console.log(
                                    "err in axios GET/ more images :",
                                    err
                                );
                            });
                    }
                };
            },
        }, //closes methods
    }); // closes Vue instance

    Vue.component("image-modal", {
        template: "#img-modal",
        data: function () {
            return {
                image: {
                    title: "",
                    description: "",
                    username: "",
                    url: "",
                    id: "",
                },
                comments: [],
                comment: {
                    username: "",
                    comment: "",
                },
            };
        },
        props: ["id"],
        mounted: function () {
            console.log("Image modal has mounted");

            var self = this;
            axios
                .get("/image/" + self.id)

                .then(function (respond) {
                    console.log("res from axios modal:", respond);
                    self.image.url = respond.data[0].url;
                    self.image.id = respond.data[0].id;
                    self.image.username = respond.data[0].username;
                    self.image.title = respond.data[0].title;
                    self.image.description = respond.data[0].description;
                })
                .catch(function (err) {
                    console.log("ERROR in mounted modal get image", err);
                });

            axios
                .get("/comments/" + self.id)

                .then(function (respond) {
                    console.log("get comments: ", respond);
                    if (respond.data.length > 0) {
                        for (let i = 0; i < respond.data.length; i++) {
                            self.comments.unshift(respond.data[i]);
                        }
                    }
                })
                .catch(function (err) {
                    console.log("ERROR in mounted modal get comments", err);
                });
        },

        // watchers is a function that runs whenever one of our props changed - this belongs in OUR COMPONENT
        watch: {
            id: function () {
                var self = this;
                console.log("id changed, This is the watcher reporting");
                console.log(self.id);
                axios
                    .get("/image/" + this.id)
                    .then(function (respond) {
                        console.log("res from axios modal:", respond);
                        self.image.url = respond.data[0].url;
                        self.image.id = respond.data[0].id;
                        self.image.username = respond.data[0].username;
                        self.image.title = respond.data[0].title;
                        self.image.description = respond.data[0].description;
                    })
                    .catch(function (err) {
                        this.sendCloseToParent;
                        console.log("ERROR in watch get image", err);
                    });

                axios
                    .get("/comments/" + this.id)
                    .then(function (respond) {
                        console.log("get comments: ", respond);
                        if (respond.data.length > 0) {
                            for (let i = 0; i < respond.data.length; i++) {
                                self.comments.unshift(respond.data[i]);
                            }
                        }
                    })
                    .catch(function (err) {
                        this.sendCloseToParent;
                        console.log("ERROR in watch get comments", err);
                    });
            },
        },

        methods: {
            postComment: function (e) {
                e.preventDefault();
                let self = this;
                console.log("this is postComment: ", this);
                axios
                    .post("/comments/:id", {
                        comment: self.comment.comment,
                        username: self.comment.username,
                        id: self.id,
                    })
                    .then(function (respond) {
                        self.comments.unshift(respond.data[0]);
                        self.comment.comment = "";
                        self.comment.username = "";
                    }); // results are from res.json(results) from db.postComment and go into then
            },

            sendCloseToParent: function () {
                console.log("Send close to parent!!!!");
                console.log("this in sendcloseto parten: ", this);
                this.$emit("close-from-modal");
            },
        },
    }); //closing component
})();
