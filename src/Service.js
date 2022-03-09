const express = require("express");
const bodyParser = require("body-parser");

class Service {

    constructor(config) {
        this.config = config;
        this.server = null;
    }

    async run() {

        const app = express();
        app.use(bodyParser.json());

        // iLert will call this when actions are fetched to be presented to the user

        app.post("/api/action-requests", (req, res) => {
            console.log("req", req.body.alert.id, req.body.user, req.body.locale);

            if(req.body.alert.summary.indexOf("dynamic test") !== -1) {
                return res.json({
                    actions: [
                        {
                            id: "xyz",
                            text: req.body.locale === "de" ? "Server neustarten" : "Restart Server"
                            // url: `http://localhost:${this.config.port}/api/action-responses`
                        }
                    ]
                });
            }

            res.json({
                actions: [
                    {
                        id: "abc",
                        text: req.body.locale === "de" ? "Aus ALB nehmen" : "Remove from ALB"
                    },
                    {
                        id: "def",
                        text: req.body.locale === "de" ? "Kafka-Playback ausführen" : "Run Kafka playback"
                    },
                    {
                        id: "ghi",
                        text: req.body.locale === "de" ? "Kubernetes pod skalieren" : "Scale Kubernetes pod"
                    }
                ]
            });
        });

        // iLert will call this when the user has made an action choice
        // Note: the response of this endpoint is used to give feedback to the user about his action
        
        app.post("/api/action-responses", (req, res) => {
            console.log("res", req.body.alert.id, req.body.user, req.body.locale);

            const id = req.body.actionId;
            console.log("selected action:", id);

            let text = null;
            switch(id) {
                case "abc": text = req.body.locale === "de" ? "Aus ALB genommen" : "Removed from ALB"; break;
                case "def": text = req.body.locale === "de" ? "Kafka topic wurde eingespielt" : "Kafka topic has been replayed"; break;
                case "ghi": text = req.body.locale === "de" ? "Kubernetes deployment wurde skaliert" : "Kubernetes deployment has been scaled"; break;
                case "xyz": text = req.body.locale === "de" ? "Server wurde neugestartet" : "Server has been restarted"; break;
                default: return res.status(400).end();
            }

            res.json({
                success: true,
                text
            });
        });

        this.server = app.listen(this.config.port, (error) => {

            if(error) {
                console.error(error);
            } else {
                console.log("Service running @ http://localhost:", this.config.port);
            }
        });
    }
}

module.exports = Service;
