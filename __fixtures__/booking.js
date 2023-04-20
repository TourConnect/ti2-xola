module.exports = {
    "id": "643f3fa910102f498350a0e4",
    "object": "order",
    "type": "order",
    "ip": "18.215.70.216",
    "reminders": {
        "notConfirmed": 0
    },
    "notes": [],
    "transactions": [
        {
            "id": "643f3fa910102f498350a0e9"
        }
    ],
    "paymentReminders": [],
    "customerName": "Daniel Smith",
    "customerEmail": "morry+daniel@tourconnect.com",
    "phone": "2222222222",
    "phoneCanonical": "2222222222",
    "currency": "USD",
    "amount": 460,
    "source": "office",
    "affiliate": "643efcc515462d330d0318a5",
    "affiliateCommission": 0,
    "balance": 0,
    "adjustments": [
        {
            "id": "643f3fa910102f498350a0e0",
            "type": "affiliate_deposit",
            "amount": -460,
            "actualAmount": -460,
            "code": "643efcc515462d330d0318a5",
            "caption": "Voucher",
            "meta": {
                "affiliate": {
                    "id": "643efcc515462d330d0318a5",
                    "name": "GYG Tour",
                    "phone": "",
                    "address": "",
                    "notes": "",
                    "url": "",
                    "code": "GYG",
                    "balance": 0,
                    "status": "active",
                    "voucher": true,
                    "allowChildren": false,
                    "delegated": false,
                    "discount": {
                        "amount": 20,
                        "amountType": "absolute",
                        "id": "643efcf00528a67c6e4d5152",
                        "scope": "person",
                        "all": true,
                        "experiences": [],
                        "memberships": []
                    },
                    "commission": {
                        "amount": 0,
                        "amountType": "absolute",
                        "id": "643efcc515462d330d0318a6",
                        "scope": "person",
                        "all": true,
                        "experiences": [],
                        "memberships": []
                    },
                    "createdAt": "2023-04-18T20:25:41+00:00",
                    "createdBy": "6438627e25d0273673056fcb",
                    "updatedAt": "2023-04-18T20:25:41+00:00",
                    "updatedBy": "6438627e25d0273673056fcb",
                    "deposit": {
                        "amount": 100,
                        "amountType": "percent",
                        "id": "643efde49b83522ac92c4179",
                        "scope": "outing",
                        "validate": false,
                        "enabled": false,
                        "depositType": "total_order_amount",
                        "all": true,
                        "experiences": [],
                        "memberships": []
                    },
                    "overrides": [],
                    "travelerNotification": {
                        "enabled": true
                    },
                    "affiliateNotification": {
                        "enabled": false
                    },
                    "due": 0,
                    "creditBalance": 0
                },
                "payment": {
                    "method": "voucher",
                    "code": "VOUCHER_GYG123"
                }
            },
            "created": "2023-04-19T01:11:05+00:00",
            "createdBy": {
                "id": "6438627e25d0273673056fcb"
            },
            "updatedAt": "2023-04-19T01:11:05+00:00",
            "payment": {
                "method": "voucher",
                "code": "VOUCHER_GYG123"
            }
        },
        {
            "id": "643f3fa910102f498350a0e2",
            "type": "payment_request",
            "amount": 0,
            "actualAmount": 0,
            "code": null,
            "caption": null,
            "created": "2023-04-19T01:11:05+00:00",
            "createdBy": {
                "id": "6438627e25d0273673056fcb"
            },
            "updatedAt": "2023-04-19T01:11:05+00:00"
        },
        {
            "id": "643f3fa910102f498350a0e5",
            "type": "payment",
            "amount": -0,
            "actualAmount": -0,
            "code": null,
            "caption": "Payment",
            "audit": {
                "balance": {
                    "old": 0,
                    "new": 0
                }
            },
            "created": "2023-04-19T01:11:05+00:00",
            "createdBy": {
                "id": "6438627e25d0273673056fcb"
            },
            "updatedAt": "2023-04-19T01:11:05+00:00"
        },
        {
            "id": "643f3fa910102f498350a0e6",
            "type": "modify",
            "amount": 0,
            "actualAmount": 0,
            "code": null,
            "caption": null,
            "audit": {
                "affiliateCommission": {
                    "old": null,
                    "new": 0
                }
            },
            "created": "2023-04-19T01:11:05+00:00",
            "createdBy": {
                "id": "6438627e25d0273673056fcb"
            },
            "updatedAt": "2023-04-19T01:11:05+00:00"
        }
    ],
    "items": [
        {
            "object": "experience_item",
            "id": "643f3fa910102f498350a0da",
            "name": "Yara Valley Tour",
            "desc": null,
            "currency": "USD",
            "seller": {
                "id": "6438627e25d0273673056fcb"
            },
            "excerpt": null,
            "guestType": "normal",
            "group": {
                "orderMin": 1,
                "orderMax": 2,
                "outingMin": 1,
                "outingMinCutoff": 3600,
                "outingMax": 2
            },
            "paymentMethod": "cc",
            "groupDiscount": {
                "enabled": false
            },
            "addOns": [],
            "updated": "2023-04-19T07:30:19+00:00",
            "sortDemographics": false,
            "cancellation": {
                "policy": "",
                "refundable": false
            },
            "event": {
                "id": "643f3fa9c4a12d5da30d8bf1"
            },
            "experience": {
                "id": "643d733e45c0452ed70d1a81"
            },
            "arrival": "2023-04-20",
            "arrivalDatetime": "2023-04-20T02:30:00-05:00",
            "arrivalTime": 230,
            "quantity": 2,
            "shortCode": "5b93e2",
            "ticketCode": "4enkzx8yxpq8",
            "priceScheme": {
                "constraints": [
                    {
                        "object": "price_type_constraint",
                        "id": "643d733e45c0452ed70d1a82",
                        "priceType": "person"
                    },
                    {
                        "object": "privacy_constraint",
                        "id": "643d733e45c0452ed70d1a83",
                        "privacy": "public"
                    }
                ],
                "price": 250
            },
            "baseAmount": 500,
            "amount": 460,
            "status": 200,
            "guestStatus": "pending",
            "demographics": [
                {
                    "id": "643d733e45c0452ed70d1a7e",
                    "quantity": 2,
                    "demographic": {
                        "id": "643d733e45c0452ed70d1a7e"
                    }
                }
            ],
            "adjustments": [
                {
                    "id": "643f3fa910102f498350a0e1",
                    "type": "discount_affiliate",
                    "amount": -40,
                    "actualAmount": -40,
                    "code": "643efcc515462d330d0318a5",
                    "caption": "Affiliate (GYG)",
                    "meta": {
                        "affiliate": {
                            "id": "643efcc515462d330d0318a5",
                            "name": "GYG Tour",
                            "phone": "",
                            "address": "",
                            "notes": "",
                            "url": "",
                            "code": "GYG",
                            "balance": 0,
                            "status": "active",
                            "voucher": true,
                            "allowChildren": false,
                            "delegated": false,
                            "discount": {
                                "amount": 20,
                                "amountType": "absolute",
                                "id": "643efcf00528a67c6e4d5152",
                                "scope": "person",
                                "all": true,
                                "experiences": [],
                                "memberships": []
                            },
                            "commission": {
                                "amount": 0,
                                "amountType": "absolute",
                                "id": "643efcc515462d330d0318a6",
                                "scope": "person",
                                "all": true,
                                "experiences": [],
                                "memberships": []
                            },
                            "createdAt": "2023-04-18T20:25:41+00:00",
                            "createdBy": "6438627e25d0273673056fcb",
                            "updatedAt": "2023-04-18T20:25:41+00:00",
                            "updatedBy": "6438627e25d0273673056fcb",
                            "deposit": {
                                "amount": 100,
                                "amountType": "percent",
                                "id": "643efde49b83522ac92c4179",
                                "scope": "outing",
                                "validate": false,
                                "enabled": false,
                                "depositType": "total_order_amount",
                                "all": true,
                                "experiences": [],
                                "memberships": []
                            },
                            "overrides": [],
                            "travelerNotification": {
                                "enabled": true
                            },
                            "affiliateNotification": {
                                "enabled": false
                            },
                            "due": 0,
                            "creditBalance": 0
                        }
                    },
                    "created": "2023-04-19T01:11:05+00:00",
                    "createdBy": {
                        "id": "6438627e25d0273673056fcb"
                    },
                    "updatedAt": "2023-04-19T01:11:05+00:00",
                    "itemId": "643f3fa910102f498350a0da"
                }
            ],
            "guestsData": [],
            "guests": [
                {
                    "id": "643f3fa910102f498350a0dd",
                    "demographic": {
                        "id": "643d733e45c0452ed70d1a7e",
                        "quantity": 2,
                        "demographic": {
                            "id": "643d733e45c0452ed70d1a7e"
                        }
                    },
                    "ticketCode": "9lg9f6o5tpss",
                    "guestStatus": "pending"
                },
                {
                    "id": "643f3fa910102f498350a0de",
                    "demographic": {
                        "id": "643d733e45c0452ed70d1a7e",
                        "quantity": 2,
                        "demographic": {
                            "id": "643d733e45c0452ed70d1a7e"
                        }
                    },
                    "ticketCode": "b9ha5yfbjvkk",
                    "guestStatus": "pending"
                }
            ],
            "waivers": [],
            "reminders2": [
                {
                    "type": "trip_reminder_to_traveler",
                    "sendReminderAt": "2023-04-19T07:30:00+00:00",
                    "sentAt": "2023-04-19T07:30:19+00:00",
                    "status": "sent"
                },
                {
                    "type": "review_reminder_to_traveler",
                    "sendReminderAt": "2023-04-21T07:49:59+00:00",
                    "status": "active"
                }
            ],
            "pluginFees": []
        }
    ],
    "tags": [
        {
            "id": "Affiliate"
        },
        {
            "id": "GYG"
        },
        {
            "id": "VOUCHER_GYG123"
        }
    ],
    "createdAt": "2023-04-19T01:11:05+00:00",
    "createdBy": {
        "id": "6438627e25d0273673056fcb"
    },
    "updatedAt": "2023-04-19T07:30:19+00:00",
    "conversation": {
        "id": "643f3fa910102f498350a0e3"
    },
    "seller": {
        "id": "6438627e25d0273673056fcb"
    },
    "organizer": {
        "id": "643f3fa910102f498350a0df"
    },
    "travelers": [
        {
            "id": "643f3fa910102f498350a0df"
        }
    ],
    "paymentIntents": [],
    "updatedBy": {
        "id": "6438627e25d0273673056fcb"
    },
    "splitPayment": {
        "enabled": false
    },
    "itemizationPreference": {
        "enabled": false
    },
    "waivers": []
}