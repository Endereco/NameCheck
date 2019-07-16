/**
 * Endereco SDK.
 *
 * @author Ilja Weber <ilja@endereco.de>
 * @copyright 2019 mobilemojo – Apps & eCommerce UG (haftungsbeschränkt) & Co. KG
 * {@link https://endereco.de}
 */
function NameCheck(config) {

    var $self  = this;
    this.mapping = config.mapping;
    this.gender = 'X';
    this.requestBody = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "nameCheck",
        "params": {
            "name": ""
        }
    };
    this.defaultConfig = {
        'useWatcher': true,
        'tid': 'not_set'
    };
    this.fieldsAreSet = false;
    this.dirty = false;
    this.config = Object.assign(this.defaultConfig, config);
    this.connector = new XMLHttpRequest();


    this.init = function() {
        try {
            $self.inputElement = document.querySelector($self.config.inputSelector);
            $self.salutationElement = document.querySelector($self.config.salutationElement);
        } catch(e) {
            console.log('Could not initiate NameCheck because of error: ', e);
        }

        // Disable browser autocomplete
        if (this.isChrome()) {
            this.inputElement.setAttribute('autocomplete', 'autocomplete_' + Math.random().toString(36).substring(2) + Date.now());
        } else {
            this.inputElement.setAttribute('autocomplete', 'off' );
        }

        // Generate TID if accounting service is set.
        if (window.accounting && ('not_set' === $self.config.tid)) {
            $self.config.tid = window.accounting.generateTID();
        }

        $self.inputElement.addEventListener('change', function() {
            var result = [],
                separators = [' ', '-', '–', '_', '.'],
                upperCase = true,
                newName = '',
                value;
            $this = this;
            value = $this.value.trim();

            for(var i = 0; i < value.length; i++)
            {
                result.push(upperCase ? value[i].toUpperCase() : value[i]);
                upperCase = false;
                if(separators.indexOf(value[i]) >= 0)
                    upperCase = true;
            }

            result = result.join('');
            newName = result.replace(/\s{2,}/g, ' ').trim();

            $this.value = newName;
            $self.checkSalutation().then( function($data) {
                $self.resetStatus($data);
            });
        });

        $self.salutationElement.addEventListener('change', function() {
            $self.checkSalutation().then( function($data) {
                $self.resetStatus($data);
            });
        });

        $self.dirty = false;
        console.log('NameCheck initiated');
    }

    this.resetStatus = function($data) {
        var event;
        $self.gender = $data.result.gender;

        if ('' === $self.salutationElement.value) {
            event = $self.createEvent('endereco.clean');
            $self.inputElement.dispatchEvent(event);
            return;
        }

        if ('M' === $self.gender) {
            if($self.mapping[$self.gender] !== $self.salutationElement.value) {
                event = $self.createEvent('endereco.check');
                $self.inputElement.dispatchEvent(event);
            } else {
                event = $self.createEvent('endereco.valid');
                $self.inputElement.dispatchEvent(event);
            }
        } else if ('F' === $self.gender) {
            if($self.mapping[$self.gender] !== $self.salutationElement.value) {
                event = $self.createEvent('endereco.check');
                $self.inputElement.dispatchEvent(event);
            } else {
                event = $self.createEvent('endereco.valid');
                $self.inputElement.dispatchEvent(event);
            }
        } else if ('N' === $self.gender) {
            event = $self.createEvent('endereco.valid');
            $self.inputElement.dispatchEvent(event);
        } else {
            event = $self.createEvent('endereco.clean');
            $self.inputElement.dispatchEvent(event);
        }
    }

    //// Functions
    this.checkSalutation = function() {
        return new Promise( function(resolve, reject) {

            $self.connector.onreadystatechange = function() {
                var $data = {};
                if(4 === $self.connector.readyState) {
                    if ($self.connector.responseText && '' !== $self.connector.responseText) {
                        try {
                            $data = JSON.parse($self.connector.responseText);
                        } catch(e) {
                            console.log('Could not parse JSON', e);
                            reject($data);
                        }

                        if ($data.result) {
                            resolve($data);
                        } else {
                            reject($data);
                        }
                    } else {
                        reject($data);
                    }
                }
            }

            $self.requestBody.params.name = $self.inputElement.value;
            $self.connector.open('POST', $self.config.endpoint, true);
            $self.connector.setRequestHeader("Content-type", "application/json");
            $self.connector.setRequestHeader("X-Auth-Key", $self.config.apiKey);
            $self.connector.setRequestHeader("X-Transaction-Id", $self.config.tid);
            $self.connector.setRequestHeader("X-Transaction-Referer", window.location.href);

            $self.connector.send(JSON.stringify($self.requestBody));
        });
    }

    // Check if the browser is chrome
    this.isChrome = function() {
        return /chrom(e|ium)/.test( navigator.userAgent.toLowerCase( ) );
    }

    /**
     * Helper that creates an event that is compatible with IE 11.
     *
     * @param eventName
     * @returns {Event}
     */
    this.createEvent = function(eventName) {
        var event;
        if(typeof(Event) === 'function') {
            event = new Event(eventName);
        }else{
            event = document.createEvent('Event');
            event.initEvent(eventName, true, true);
        }
        return event;
    }

    /**
     * Helper function to update existing config, overwriting existing fields.
     *
     * @param newConfig
     */
    this.updateConfig = function(newConfig) {
        $self.config = Object.assign($self.config, newConfig);
    }

    /**
     * Checks if fields are set.
     */
    this.checkIfFieldsAreSet = function() {
        var areFieldsSet = false;
        if((null !== document.querySelector(config.inputSelector))
            && (null !== document.querySelector(config.salutationElement))) {
            areFieldsSet = true;
        }

        if (!$self.fieldsAreSet && areFieldsSet) {
            $self.dirty = true;
            $self.fieldsAreSet = true;
        } else if($self.fieldsAreSet && !areFieldsSet) {
            $self.fieldsAreSet = false;
        }
    }

    // Check if the browser is chrome
    this.isChrome = function() {
        return /chrom(e|ium)/.test( navigator.userAgent.toLowerCase( ) );
    }

    // Service loop.
    setInterval( function() {

        if ($self.config.useWatcher) {
            $self.checkIfFieldsAreSet();
        }

        if ($self.dirty) {
            $self.init();
        }
    }, 300);
}
