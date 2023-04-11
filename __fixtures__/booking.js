module.exports = {
  "id": "643049d367480a25e061654e",
  "object": "order",
  "type": "order",
  "ip": "18.215.70.216",
  "reminders": {
      "notConfirmed": 0
  },
  "notes": [],
  "transactions": [],
  "paymentReminders": [],
  "customerName": "Jane2 Doe",
  "customerEmail": "jane2@example.org",
  "currency": "USD",
  "amount": 240,
  "source": "xola",
  "balance": 240,
  "adjustments": [
      {
          "id": "643049d367480a25e061654c",
          "type": "payment_request",
          "amount": -240,
          "actualAmount": -240,
          "code": null,
          "caption": null,
          "meta": {
              "payment": {
                  "method": "gift"
              }
          },
          "created": "2023-04-07T16:50:27+00:00",
          "createdBy": {
              "id": "6418b34decc22454550c1450"
          },
          "updatedAt": "2023-04-07T16:50:27+00:00",
          "payment": {
              "method": "gift"
          }
      }
  ],
  "items": [
      {
          "object": "experience_item",
          "id": "643049d367480a25e0616543",
          "name": "Alpine Lakes Sightseeing",
          "desc": null,
          "currency": "USD",
          "seller": {
              "id": "4f35b7ae536e865b5e000000"
          },
          "excerpt": null,
          "guestType": "normal",
          "group": {
              "orderMin": 1,
              "orderMax": 12,
              "outingMin": 1,
              "outingMinCutoff": 3600,
              "outingMax": 12
          },
          "paymentMethod": "cc",
          "groupDiscount": {
              "enabled": false
          },
          "addOns": [],
          "updated": "2023-04-07T16:50:27+00:00",
          "sortDemographics": false,
          "event": {
              "id": "642f076af34c70d2b926c831"
          },
          "experience": {
              "id": "4f35e82b536e86096b000000"
          },
          "arrival": "2023-05-07",
          "arrivalDatetime": "2023-05-07T08:00:00-07:00",
          "arrivalTime": 800,
          "quantity": 2,
          "shortCode": "cfce36",
          "ticketCode": "23ug6vjnb880",
          "priceScheme": {
              "constraints": [
                  {
                      "object": "price_type_constraint",
                      "id": "643049d367480a25e061654f",
                      "priceType": "person"
                  },
                  {
                      "object": "privacy_constraint",
                      "id": "643049d367480a25e0616550",
                      "privacy": "private"
                  }
              ],
              "price": 120
          },
          "baseAmount": 240,
          "amount": 240,
          "status": 100,
          "guestStatus": "pending",
          "demographics": [
              {
                  "id": "642f02fa488f086188463c71",
                  "quantity": 2,
                  "demographic": {
                      "id": "54ae454be5bdf063beb5cced",
                      "object": "experience_demographic",
                      "createdAt": "2017-07-31T09:06:10+00:00",
                      "updatedAt": "2023-04-06T17:54:50+00:00",
                      "label": "Guests",
                      "labelCanonical": "guests",
                      "all": false,
                      "seller": {
                          "id": "4f35b7ae536e865b5e000000"
                      },
                      "parent": {
                          "id": "597ef3016132ba4d66675427"
                      },
                      "overrideCaption": true,
                      "experience": {
                          "id": "4f35e82b536e86096b000000"
                      }
                  }
              }
          ],
          "adjustments": [],
          "guestsData": [],
          "guests": [
              {
                  "id": "643049d367480a25e0616548",
                  "demographic": {
                      "id": "642f02fa488f086188463c71",
                      "quantity": 2,
                      "demographic": {
                          "id": "54ae454be5bdf063beb5cced"
                      }
                  },
                  "ticketCode": "47tnoh2k4su8",
                  "guestStatus": "pending"
              },
              {
                  "id": "643049d367480a25e0616549",
                  "demographic": {
                      "id": "642f02fa488f086188463c71",
                      "quantity": 2,
                      "demographic": {
                          "id": "54ae454be5bdf063beb5cced"
                      }
                  },
                  "ticketCode": "duo0fsd7ra0c",
                  "guestStatus": "pending"
              }
          ],
          "waivers": [],
          "reminders2": [
              {
                  "type": "trip_reminder_to_traveler",
                  "sendReminderAt": "2023-05-06T15:00:00+00:00",
                  "status": "active"
              },
              {
                  "type": "review_reminder_to_traveler",
                  "sendReminderAt": "2023-05-13T07:59:59-07:00",
                  "status": "active"
              }
          ],
          "pluginFees": []
      }
  ],
  "tags": [],
  "createdAt": "2023-04-07T16:50:27+00:00",
  "createdBy": {
      "id": "6418b34decc22454550c1450"
  },
  "updatedAt": "2023-04-07T16:50:27+00:00",
  "conversation": {
      "id": "643049d367480a25e061654d",
      "orderStatus": null,
      "order": {
          "id": "643049d367480a25e061654e"
      },
      "seller": {
          "id": "4f35b7ae536e865b5e000000"
      },
      "updatedAt": "2023-04-07T16:50:27+00:00",
      "participants": [
          {
              "id": "4f35b7ae536e865b5e000000",
              "name": "Tad Spinka V",
              "tags": [],
              "reminder": 0,
              "type": 1
          },
          {
              "id": "642f0836f31f683abd518558",
              "name": "Jane2 Doe",
              "tags": [
                  "unread"
              ],
              "reminder": 0,
              "type": 2
          }
      ],
      "messages": [
          {
              "object": "message",
              "id": "643049d367480a25e0616557",
              "from": "4f35b7ae536e865b5e000000",
              "subject": null,
              "body": "Your booking for Alpine Lakes Sightseeing on May 7, 2023 at 8:00 AM has been requested.",
              "type": null,
              "system": null,
              "to": [
                  {
                      "id": "642f0836f31f683abd518558",
                      "name": "Jane2 Doe",
                      "tags": [
                          "unread"
                      ],
                      "reminder": 0,
                      "type": 2
                  }
              ]
          }
      ]
  },
  "seller": {
      "id": "4f35b7ae536e865b5e000000"
  },
  "organizer": {
      "id": "642f0836f31f683abd518558",
      "enabled": true,
      "remoteCards": [],
      "name": "Jane2 Doe",
      "email": "jane2@example.org",
      "phone": null,
      "emailCanonical": "jane2@example.org",
      "username": null,
      "usernameCanonical": "",
      "seller": {
          "id": "4f35b7ae536e865b5e000000"
      },
      "additionalNames": [],
      "additionalPhones": [],
      "isOrganizer": true,
      "lifetimeValue": 0
  },
  "travelers": [
      {
          "id": "642f0836f31f683abd518558"
      }
  ],
  "paymentIntents": [],
  "updatedBy": {
      "id": "642f0836f31f683abd518558"
  },
  "splitPayment": {
      "enabled": false
  },
  "itemizationPreference": {
      "enabled": false
  }
}