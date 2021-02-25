
// stores all raw unit data and stats
const scale = 0.75;

export var unitNames = ['Swordsman', 'Longswordsman', 'Cossack', 'Knight', 'Crossbowman'];

export var imageClasses = ['L', 'R'];

export var unitTypes = {
    'Longswordsman':{

        'size':4 * scale,

        'mStatuses':{
            'charging':{
                'speed':0.72 * scale,
                'morale': 3.5,
                'damage':4
            },
            'advancing':{
                'speed':0.5 * scale,
                'morale': 0.35,
                'damage':4
            },
            'retreating':{
                'speed':0.2 * scale,
                'morale': 0.1,
                'damage':3
            },
            'routed':{
                'speed':0.55 * scale,
                'morale': 0,
                'damage':0
            }
        },

        'mMax':300,
        'hMax':300,

        'formation':{
            'rows':2,
            'columns':2
        },

        'behaviour':{

            'straggler':0.5,
            'burst':50,
            'burstPower':5,
            'group':1,
            'flanking':false,
            'range':0,
            'minRange':0

        }
    },

    'Swordsman':{
        'size':6 * scale,
        'mStatuses':{
            'charging':{
                'speed':0.8 * scale,
                'morale': 3,
                'damage':2
            },
            'advancing':{
                'speed':0.6 * scale,
                'morale': 1,
                'damage':1.5
            },
            'retreating':{
                'speed':0.45 * scale,
                'morale': 0.3,
                'damage':1
            },
            'routed':{
                'speed':0.75 * scale,
                'morale': 0,
                'damage':0
            }
        },
        'mMax':100,
        'hMax':100,

        'formation':{
            'rows':3,
            'columns':5
        },

        'behaviour':{
            'straggler':1,
            'burst':50,
            'burstPower':5,
            'group':1,
            'flanking':false,
            'range':0,
            'minRange':0
        }
    },

    'Cossack':{
        'size':8 * scale,
        'mStatuses':{
            'charging':{
                'speed':1.5 * scale,
                'morale': 1,
                'damage':2
            },
            'advancing':{
                'speed':0.75 * scale,
                'morale': 0.4,
                'damage':1
            },
            'retreating':{
                'speed':0.6 * scale,
                'morale': 0.35,
                'damage':0.8
            },
            'routed':{
                'speed':1 * scale,
                'morale': 0,
                'damage':0
            }
        },
        'mMax':80,
        'hMax':80,

        'formation':{
            'rows':2,
            'columns':4
        },

        'behaviour':{
            'straggler':5,
            'burst':200,
            'burstPower':10,
            'group':1,
            'flanking':true,
            'flankDist':15,
            'flankAngle': 1,
            'range':0,
            'minRange':0
        }
    },

    'Knight':{
        'size':4 * scale,
        'mStatuses':{
            'charging':{
                'speed':1.2 * scale,
                'morale': 0.65,
                'damage':6
            },
            'advancing':{
                'speed':0.65 * scale,
                'morale': 0.6,
                'damage':3
            },
            'retreating':{
                'speed':0.45 * scale,
                'morale': 0.3,
                'damage':1
            },
            'routed':{
                'speed':0.95 * scale,
                'morale': 0,
                'damage':0
            }
        },
        'mMax':300,
        'hMax':200,

        'formation':{
            'rows':1,
            'columns':4
        },

        'behaviour':{
            'straggler':0.7,
            'burst':150,
            'burstPower':40,
            'group':1,
            'flanking':false,
            'range':0,
            'minRange':0
        },
    },

    'Crossbowman':{
        'size':8 * scale,
        'mStatuses':{
            'charging':{
                'speed':0.7 * scale,
                'morale': 3,
                'damage':1.5
            },
            'advancing':{
                'speed':0.45 * scale,
                'morale': 0.5,
                'damage':1.5
            },
            'retreating':{
                'speed':0.45 * scale,
                'morale': 0.3,
                'damage':0.5
            },
            'routed':{
                'speed':0.8 * scale,
                'morale': 0,
                'damage':0
            }
        },
        'mMax':65,
        'hMax':60,

        'formation':{
            'rows':4,
            'columns':2
        },

        'behaviour':{
            'straggler':1,
            'burst':50,
            'burstPower':5,
            'group':1,
            'flanking':false,
            'range':3,
            'minRange':1.5
        }
    }
}



