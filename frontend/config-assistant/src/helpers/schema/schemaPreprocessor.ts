import type {JsonSchemaObjectType} from '@/model/JsonSchemaType';
// @ts-ignore
import mergeAllOf from 'json-schema-merge-allof';
import pointer from 'json-pointer';
import {useSessionStore} from '@/store/sessionStore';
import {nonBooleanSchema} from '@/helpers/schema/SchemaUtils';

const preprocessedRefSchemas: Map<string, JsonSchemaObjectType> = new Map();

/**
 * Preprocesses the schema.
 *
 * @param schema the schema to preprocess
 * @returns the preprocessed schema
 */
export function preprocessSchema(schema: JsonSchemaObjectType): JsonSchemaObjectType {
  let copiedSchema = {...schema}; // shallow copy to prevent changing the original schema
  // TODO: resolve refs once at the beginning using json-schema-ref-parser
  // this is technically possible because the json schema faker also uses json-schema-ref-parser
  // and it works there
  // so we have to find a way to make it work here as well
  if (hasRef(copiedSchema)) {
    // remove leading # from ref if present
    const refString = copiedSchema.$ref?.startsWith('#')
      ? copiedSchema.$ref.substring(1)
      : copiedSchema.$ref!!;

    let refSchema: any;
    if (preprocessedRefSchemas.has(refString)) {
      refSchema = preprocessedRefSchemas.get(refString);
    } else {
      refSchema = pointer.get(
        nonBooleanSchema(useSessionStore().fileSchemaData ?? {}) ?? {},
        refString
      );
      refSchema = preprocessSchema(refSchema);
      preprocessedRefSchemas.set(refString, refSchema);
    }

    delete copiedSchema.$ref;
    copiedSchema = {allOf: [copiedSchema, refSchema]};
  }

  if (hasAllOfs(copiedSchema)) {
    // @ts-ignore
    copiedSchema.allOf = copiedSchema.allOf!!.map((subSchema, index) =>
      preprocessSchema(subSchema as JsonSchemaObjectType)
    );
    copiedSchema = mergeAllOf(copiedSchema, {
      resolvers: {
        defaultResolver: mergeAllOf.options.resolvers.title,
      },
    });
  }

  induceTitles(copiedSchema);

  return copiedSchema;
}

function hasRef(schema: JsonSchemaObjectType): boolean {
  return schema.$ref !== undefined;
}

function hasAllOfs(schema: JsonSchemaObjectType): boolean {
  return schema.allOf !== undefined && schema.allOf.length > 0;
}

function induceTitles(schema: JsonSchemaObjectType): void {
  induceTitlesOnObject(schema.properties ?? {});
  induceTitlesOnObject(schema.definitions ?? {});
  induceTitlesOnObject(schema.$defs ?? {});
}

function induceTitlesOnObject(object: object) {
  Object.entries(object).forEach(([key, value]) => {
    if (typeof value === 'object') {
      if (value.title === undefined) {
        value.title = key;
      }
    }
  });
}
