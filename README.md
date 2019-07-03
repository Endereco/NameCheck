# NameCheck

Searches for the name in our database and return the name and salutation. If salutation is not matching the gender, marks the salutation field.

## Installation

In order to pull the latest version:

### npm (preferred)

```
npm i @endereco/namecheck
```

### github

```
git clone https://github.com/Endereco/NameCheck.git
```

Then include NameCheck.js in `<header>` or before config.

## Configuration

In order to use name check you must specify the fields that make the name and salutation, salutation mapping and some colors.

Here is an example configuration:

```
new NameCheck({
    'inputSelector': 'input[name="register[shipping][firstname]"]',
    'salutationElement': 'select[name="register[shipping][salutation]"]',
    'endpoint': 'https://example-domain.com/endpoint',
    'apiKey': '041c3c302746cf37722560a7a285690738a7db4e55b7aaf26a545ffabd318a83',
    'mapping': {
        'M': 'mr',
        'F': 'ms',
        'N': '',
        'X': ''
    },
    'colors' : {
        'primaryColor' => '#fff',
        'primaryColorHover' => '#fff',
        'primaryColorText' => '#fff',
        'secondaryColor' => '#fff',
        'secondaryColorHover' => '#fff',
        'secondaryColorText' => '#fff',
        'warningColor' => '#fff',
        'warningColorHover' => '#fff',
        'warningColorText' => '#fff',
        'successColor' => '#fff',
        'successColorHover' => '#fff',
        'successColorText' => '#fff'
    }
});
```

## Dependencies

NameCheck relies on StatusIndicator to mark fields green on correct input.

NameCheck also relies on Accounting to generate the tid and track transactions.
