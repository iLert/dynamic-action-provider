const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios").default;

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

            const locale = (req.body.locale || "en").toLowerCase();
            console.log("req", req.body.alert ? req.body.alert.id : "no alert", req.body.user, locale);

            if(req.body && req.body.alert && req.body.alert.summary
                && req.body.alert.summary.indexOf("dynamic test") !== -1) {
                return res.json({
                    actions: [
                        {
                            id: "xyz",
                            text: locale === "de" ? "Server neustarten" : "Restart Server"
                            // url: `http://localhost:${this.config.port}/api/action-responses`
                        }
                    ]
                });
            }

            // playing around with ansible tower, you could ask your ansible tower instance for available playbooks here
            if(req.body && req.body.alert && req.body.alert.summary
                && req.body.alert.summary.toLowerCase().indexOf("tablespace percentage full") !== -1) {
                return res.json({
                    actions: [
                        {
                            id: "ansible5001",
                            text: locale === "de" ? "Ansible-Playbook 5001 starten" : "Run ansible playbook 5001"
                        },
                        {
                            id: "ansible5002",
                            text: locale === "de" ? "Ansible-Playbook 5002 starten" : "Run ansible playbook 5002"
                        },
                        {
                            id: "ansible5003",
                            text: locale === "de" ? "Ansible-Playbook 5003 starten" : "Run ansible playbook 5002"
                        }
                    ]
                });
            }

            res.json({
                actions: [
                    {
                        id: "abc",
                        text: locale === "de" ? "Aus ALB nehmen" : "Remove from ALB"
                    },
                    {
                        id: "def",
                        text: locale === "de" ? "Kafka-Playback ausführen" : "Run Kafka playback"
                    },
                    {
                        id: "ghi",
                        text: locale === "de" ? "Kubernetes pod skalieren" : "Scale Kubernetes pod"
                    }
                ]
            });
        });

        // iLert will call this when the user has made an action choice
        // Note: the response of this endpoint is used to give feedback to the user about his action
        
        app.post("/api/action-responses", async (req, res) => {

            const locale = (req.body.locale || "en").toLowerCase();
            console.log("res", req.body.alert ? req.body.alert.id : "no alert", req.body.user, locale);

            const id = req.body.actionId;
            console.log("selected action:", id);

            let text = null;

            // playing around with ansible tower
            if(id.startsWith("ansible")) {
                const playbookId = id.replace("ansible", "").trim();
                try {
                    text = await this.triggerAnsiblePlaybook(playbookId, locale);
                    res.json({
                        success: true,
                        text
                    });
                } catch(error) {
                    res.json({
                        success: false,
                        text: "Failed to execute ansible playbook: " + error.message
                    });
                }
                return;
            }

            switch(id) {
                case "abc": text = locale === "de" ? "Aus ALB genommen" : "Removed from ALB"; break;
                case "def": text = locale === "de" ? "Kafka topic wurde eingespielt" : "Kafka topic has been replayed"; break;
                case "ghi": text = locale === "de" ? "Kubernetes deployment wurde skaliert" : "Kubernetes deployment has been scaled"; break;
                case "xyz": text = locale === "de" ? "Server wurde neugestartet" : "Server has been restarted"; break;
                default: return res.status(400).end();
            }

            res.json({
                success: true,
                text
            });
        });

        app.get("/ping", (req, res) => {
            res.end();
        });

        app.post("/ping", (req, res) => {
            console.log("ping");
            res.json({});
        });

        this.server = app.listen(this.config.port, (error) => {

            if(error) {
                console.error(error);
            } else {
                console.log("Service running @ http://localhost:", this.config.port);
            }
        });
    }

    async triggerAnsiblePlaybook(id, locale) {

        // remember to adjust your url
        const ansibleTowerHost = `https://your.tower.server/api/v2/job_templates/${id}/launch`;
        // const ansibleTowerHost = `http://localhost:8087/ping`;
        const options = {
            method: "post",
            url: ansibleTowerHost,
            data: {},
            headers: { // remember to adjust your token
                "Authorization": "your-api-token"
            },
            timeout: 2500
        };

        const _ = await axios(options);
        // no exception == OK
        if(locale === "de") {
            return `Ansible-Playbook ${id} gestartet.`;
        } else {
            return `Ansible playbook ${id} started.`;
        }
    }
}

module.exports = Service;
