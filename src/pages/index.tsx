import { RJSFSchema, UiSchema } from '@rjsf/utils'

export default function HomePage() {
  const schema: RJSFSchema = {
    title: 'A registration form',
    description: 'A simple form example.',
    type: 'object',
    required: ['firstName', 'lastName'],
    properties: {
      firstName: {
        type: 'string',
        title: 'First name',
        default: 'Chuck',
      },
      lastName: {
        type: 'string',
        title: 'Last name',
      },
      age: {
        type: 'integer',
        title: 'Age',
      },
      bio: {
        type: 'string',
        title: 'Bio',
      },
      password: {
        type: 'string',
        title: 'Password',
        minLength: 3,
      },
      telephone: {
        type: 'string',
        title: 'Telephone',
        minLength: 10,
      },
    },
  }

  const uiSchema: UiSchema = {
    firstName: {
      'ui:autofocus': true,
      'ui:emptyValue': '',
      'ui:placeholder': 'ui:emptyValue causes this field to always be valid despite being required',
      'ui:autocomplete': 'family-name',
      'ui:enableMarkdownInDescription': true,
      'ui:description':
        'Make text **bold** or *italic*. Take a look at other options [here](https://probablyup.com/markdown-to-jsx/).',
    },
    lastName: {
      'ui:autocomplete': 'given-name',
      'ui:enableMarkdownInDescription': true,
      'ui:description':
        'Make things **bold** or *italic*. Embed snippets of `code`. <small>And this is a small texts.</small> ',
    },
    age: {
      'ui:widget': 'updown',
      'ui:title': 'Age of person',
      'ui:description': '(earth year)',
    },
    bio: {
      'ui:widget': 'textarea',
    },
    password: {
      'ui:widget': 'password',
      'ui:help': 'Hint: Make it strong!',
    },
    telephone: {
      'ui:options': {
        inputType: 'tel',
      },
    },
  }

  const formData = {
    firstName: 'Chuck',
    lastName: 'Norris',
    age: 75,
    bio: 'I like to box',
    password: 'password',
    telephone: '123456789',
  }

  return (
    <div className="p-4">
      <h1>Home Page</h1>
    </div>
  )
}
