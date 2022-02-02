import Conf, { Schema } from 'conf'
import { Static, Type } from '@sinclair/typebox'

export const instanceModes = [Type.Literal('classic'), Type.Literal('docker')]

const instanceMode = Type.Union(instanceModes)

export type InstanceMode = Static<typeof instanceMode>

export const configSchema = {
  instances: Type.Array(
    Type.Object({
      name: Type.String({ examples: ['Office'] }),
      path: Type.String({ examples: ['/home/user/.leon'] }),
      mode: instanceMode,
      birthDate: Type.String({ examples: ['2021-04-26T13:47:41.319Z'] }),
      startCount: Type.Integer({ examples: [1] })
    }),
    { default: [] }
  )
}

export const configSchemaObject = Type.Strict(
  Type.Object(configSchema, {
    additionalProperties: false,
    default: {
      instances: []
    }
  })
)

export type ConfigData = Static<typeof configSchemaObject>

export const config = new Conf({
  schema: configSchemaObject.properties as Schema<ConfigData>,
  configName: 'leon-ai',
  projectSuffix: ''
})
