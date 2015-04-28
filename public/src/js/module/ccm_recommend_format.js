var ccmForRec = {
  "clazz": {
    "ID65252430": {
      "name": [
        {
          "value": "Course",
          "reference": 5
        },
        {
          "value": "Class",
          "reference": 5
        },
        {
          "value": "Courses",
          "reference": 1
        }
      ],
      "attribute": {
        "ID65252431": {
          "name": [
            {
              "value": "name",
              "reference": 1
            }
          ],
          "type": [
            {
              "value": "string",
              "reference": 1
            }
          ]
        },
        "ID65252432": {
          "name": [
            {
              "value": "code",
              "reference": 1
            },
            {
              "value": "studentNumber",
              "reference": 1
            }
          ],
          "type": [
            {
              "value": "string",
              "reference": 1
            }
          ]
        },
        "ID65252433": {
          "name": [
            {
              "value": "credit",
              "reference": 1
            }
          ],
          "type": [
            {
              "value": "float",
              "reference": 1
            }
          ]
        },
        "ID65252434": {
          "name": [
            {
              "value": "character",
              "reference": 1
            }
          ],
          "type": [
            {
              "value": "ID65252435",
              "reference": 1
            }
          ]
        }
      },
      "reference": 11
    },
    "ID65252435": {
      "name": [
        {
          "value": "CourseCharacter",
          "reference": 1
        }
      ],
      "attribute": {
        "ID65252436": {
          "name": [
            {
              "value": "compulsory",
              "reference": 1
            },
            {
              "value": "mustTake",
              "reference": 1
            }
          ]
        },
        "ID65252437": {
          "name": [
            {
              "value": "elective",
              "reference": 1
            },
            {
              "value": "selective",
              "reference": 1
            }
          ]
        },
        "ID65252438": {
          "name": [
            {
              "value": "limited",
              "reference": 1
            }
          ]
        }
      }
    },
    "ID65252439": {
      "name": [
        {
          "value": "CourseActivity",
          "reference": 1
        },
        {
          "value": "CourseAction",
          "reference": 1
        }
      ],
      "attribute": {
        "ID65252440": {
          "name": [
            {
              "value": "startTime",
              "reference": 1
            },
            {
              "value": "beginTime",
              "reference": 1
            },
            {
              "value": "timeToGo",
              "reference": 1
            }
          ],
          "type": [
            {
              "value": "ID65252443",
              "reference": 1
            }
          ]
        },
        "ID65252441": {
          "name": [
            {
              "value": "endTime",
              "reference": 1
            },
            {
              "value": "finishTime",
              "reference": 1
            }
          ],
          "type": [
            {
              "value": "ID65252443",
              "reference": 1
            }
          ]
        },
        "ID65252442": {
          "name": [
            {
              "value": "place",
              "reference": 1
            },
            {
              "value": "room",
              "reference": 1
            }
          ],
          "type": [
            {
              "value": "string",
              "reference": 1
            }
          ]
        },
        "ID65252443": {
          "name": [
            {
              "value": "weekNum",
              "reference": 1
            }
          ],
          "type": [
            {
              "value": "int",
              "reference": 1
            }
          ]
        }
      }
    },
    "ID65252444": {
      "name": [
        {
          "value": "Time",
          "reference": 1
        }
      ],
      "attribute": {
        "ID65252445": {
          "name": [
            {
              "value": "hour",
              "reference": 1
            }
          ]
        },
        "ID65252446": {
          "name": [
            {
              "value": "minute",
              "reference": 1
            }
          ]
        },
        "ID65252447": {
          "name": [
            {
              "value": "second",
              "reference": 1
            }
          ]
        }
      }
    }
  },
  "relationGroup": {
    "ID65252430-ID65252439": {
      "ID65252448": {
        "type": [
          {
            "value": "Composition",
            "reference": 1
          }
        ],
        "role": {
          "e0": [
            {
              "value": "whole",
              "reference": 1
            }
          ],
          "e1": [
            {
              "value": "part",
              "reference": 1
            }
          ]
        },
        "clazz": {
          "e0": [
            {
              "value": "ID65252430",
              "reference": 1
            }
          ],
          "e1": [
            {
              "value": "ID65252439",
              "reference": 1
            }
          ]
        },
        "multiplicity": {
          "e0": [
            {
              "value": "1",
              "reference": 1
            },
            {
              "value": "*",
              "reference": 1
            },
            {
              "value": "1..*",
              "reference": 1
            }
          ],
          "e1": [
            {
              "value": "*",
              "reference": 1
            }
          ]
        }
      }
    }
  },
  "index": {
    "Name2Id": {
      "Course": [
        "ID65252430"
      ],
      "Class": [
        "ID65252430"
      ],
      "Courses": [
        "ID65252430"
      ],
      "name": [
        "ID65252431"
      ]
    },
    "Multi2Id": {

    }
  }
};

var clazz = ccmForRec.clazz