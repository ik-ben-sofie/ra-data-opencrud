import {
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE
} from 'react-admin';
import buildVariables from './buildVariables';
import { TypeKind } from 'graphql/type/introspection';
import { IntrospectionResult, Resource } from './constants/interfaces';

describe('buildVariables', () => {
  describe('GET_LIST', () => {
    it('returns correct variables', () => {
      const introspectionResult = {
        types: [
          {
            kind: 'INPUT_OBJECT',
            name: 'PostWhereInput',
            inputFields: [{ name: 'tags_some', type: { kind: '', name: '' } }]
          }
        ]
      };
      const params = {
        filter: {
          ids: ['foo1', 'foo2'],
          tags: { id: ['tag1', 'tag2'] },
          'author.id': 'author1',
          views: 100
        },
        pagination: { page: 10, perPage: 10 },
        sort: { field: 'sortField', order: 'DESC' }
      };

      expect(
        buildVariables(introspectionResult as unknown as IntrospectionResult)(
          { type: { name: 'Post' } } as Resource,
          GET_LIST,
          params
        )
      ).toEqual({
        where: {
          id_in: ['foo1', 'foo2'],
          tags_some: { id_in: ['tag1', 'tag2'] },
          author: { id: 'author1' },
          views: 100
        },
        first: 10,
        orderBy: 'sortField_DESC',
        skip: 90
      });
    });
  });

  describe('CREATE', () => {
    const introspectionResult = {
      types: [
        {
          name: 'Post',
          fields: [
            {
              name: 'title'
            }
          ]
        },
        {
          name: 'PostCreateInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [
            {
              name: 'author',
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'AuthorCreateOneInput'
                }
              }
            },
            {
              name: 'tags',
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'TagCreateManyInput'
                }
              }
            },
            {
              name: 'title',
              type: {
                kind: TypeKind.SCALAR,
                name: 'String'
              }
            }
          ]
        },
        {
          name: 'AuthorCreateOneInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [
            {
              name: 'connect',
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'AuthorWhereUniqueInput'
                }
              }
            },
            {
              name: 'create',
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'AuthorCreateInput'
                }
              },
            }
          ]
        },
        {
          name: 'AuthorCreateInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [{
            name: 'name',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String'
            }
          }]
        },
        {
          name: 'AuthorWhereUniqueInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [
            {
              name: 'id',
              type: {
                kind: TypeKind.SCALAR,
                name: 'String'
              }
            }
          ]
        },
        {
          name: 'TagCreateManyInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [
            {
              name: 'connect',
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'TagWhereUniqueInput'
                }
              }
            },
            {
              name: 'create',
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'TagCreateInput'
                }
              }
            }
          ]
        },
        {
          name: 'TagCreateInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [{
            name: 'name',
            type: {
              kind: TypeKind.SCALAR,
              name: 'String'
            }
          }]
        },
        {
          name: 'TagWhereUniqueInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [
            {
              name: 'id',
              type: {
                kind: TypeKind.SCALAR,
                name: 'String'
              }
            }
          ]
        }
      ]
    };

    it('drops field not in Create schema', () => {
      const params = {
        data: {
          author: { id: 'author1' },
          title: 'Foo',
          tags: [{ id: 'tags1' }, { id: 'tags2' }],
          tagsIds: ['tags1', 'tags2'],
          createdAt: new Date()
        }
      };

      expect(
          buildVariables(introspectionResult as unknown as IntrospectionResult)(
              { type: { name: 'Post' } } as Resource,
              CREATE,
              params
          )
      ).toEqual({
        data: {
          author: { connect: { id: 'author1' } },
          tags: {
            connect: [{ id: 'tags1' }, { id: 'tags2' }]
          },
          title: 'Foo'
        }
      });
    });

    it('returns correct variables', () => {
      const params = {
        data: {
          author: { id: 'author1' },
          title: 'Foo',
          tags: [{ id: 'tags1' }, { id: 'tags2' }],
          tagsIds: ['tags1', 'tags2']
        }
      };

      expect(
        buildVariables(introspectionResult as unknown as IntrospectionResult)(
          { type: { name: 'Post' } } as Resource,
          CREATE,
          params
        )
      ).toEqual({
        data: {
          author: { connect: { id: 'author1' } },
          tags: {
            connect: [{ id: 'tags1' }, { id: 'tags2' }]
          },
          title: 'Foo'
        }
      });
    });

    it('decides between create and connect', () => {
      const params = {
        data: {
          author: { name: 'author1' },
          title: 'Foo',
          tags: [{ id: 'tags1' }, { id: 'tags2' }],
          tagsIds: ['tags1', 'tags2']
        }
      };

      expect(
          buildVariables(introspectionResult as unknown as IntrospectionResult)(
              { type: { name: 'Post' } } as Resource,
              CREATE,
              params
          )
      ).toEqual({
        data: {
          author: { create: { name: 'author1' } },
          tags: {
            connect: [{ id: 'tags1' }, { id: 'tags2' }]
          },
          title: 'Foo'
        }
      });
    });

    it('decides between connect over create when specifying id', () => {
      const params = {
        data: {
          author: { id: 'author1', name: 'differentName' },
          title: 'Foo',
          tags: [{ id: 'tags1' }, { id: 'tags2' }],
          tagsIds: ['tags1', 'tags2']
        }
      };

      expect(
          buildVariables(introspectionResult as unknown as IntrospectionResult)(
              { type: { name: 'Post' } } as Resource,
              CREATE,
              params
          )
      ).toEqual({
        data: {
          author: { connect: { id: 'author1' } },
          tags: {
            connect: [{ id: 'tags1' }, { id: 'tags2' }]
          },
          title: 'Foo'
        }
      });
    });


    // TODO: Determine whether this is desirable
    xit('can handle array creates', () => {
      const params = {
        data: {
          author: { id: 'author1' },
          title: 'Foo',
          tags: [{ name: 'tags1' }, { name: 'tags2' }],
          tagsIds: ['tags1', 'tags2']
        }
      };

      expect(
          buildVariables(introspectionResult as unknown as IntrospectionResult)(
              { type: { name: 'Post' } } as Resource,
              CREATE,
              params
          )
      ).toEqual({
        data: {
          author: { connect: { id: 'author1' } },
          tags: {
            create: [{ name: 'tags1' }, { name: 'tags2' }]
          },
          title: 'Foo'
        }
      });
    })
  });

  describe('UPDATE', () => {
    const introspectionResult = {
      types: [
        {
          name: 'Post',
          fields: [{ name: 'title' }]
        },
        {
          name: 'PostUpdateInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [
            {
              name: 'author',
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'AuthorUpdateOneInput'
                }
              }
            },
            {
              name: 'tags',
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'TagsUpdateManyInput'
                }
              }
            },
            {
              name: 'title',
              type: {
                kind: TypeKind.SCALAR,
                name: 'String'
              }
            }
          ]
        },
        {
          name: 'AuthorUpdateOneInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [
            {
              name: 'connect',
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'AuthorWhereUniqueInput'
                }
              }
            }
          ]
        },
        {
          name: 'TagsUpdateManyInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [
            {
              name: 'connect',
              type: {
                kind: TypeKind.NON_NULL,
                ofType: {
                  kind: TypeKind.INPUT_OBJECT,
                  name: 'TagsWhereUniqueInput'
                }
              }
            }
          ]
        },
        {
          name: 'TagsWhereUniqueInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [
            {
              name: 'id',
              type: {
                kind: TypeKind.SCALAR,
                name: 'String'
              }
            }
          ]
        },
        {
          name: 'AuthorWhereUniqueInput',
          kind: TypeKind.INPUT_OBJECT,
          inputFields: [
            {
              name: 'id',
              type: {
                kind: TypeKind.SCALAR,
                name: 'String'
              }
            }
          ]
        }
      ]
    };

    it('drops immutable fields', () => {
      const params = {
        data: {
          id: 'postId',
          tags: [{ id: 'tags1' }, { id: 'tags2' }],
          tagsIds: ['tags1', 'tags2'],
          author: { id: 'author1' },
          title: 'Foo',
          createdAt: new Date()
        },
        previousData: {
          tags: [{ id: 'tags1' }],
          tagsIds: ['tags1']
        }
      };

      expect(
          buildVariables(introspectionResult as unknown as IntrospectionResult)(
              { type: { name: 'Post' } } as Resource,
              UPDATE,
              params
          )
      ).toEqual({
        where: { id: 'postId' },
        data: {
          author: { connect: { id: 'author1' } },
          tags: {
            connect: [{ id: 'tags2' }],
            disconnect: [],
            update: []
          },
          title: 'Foo'
        }
      });
    });

    it('returns correct variables', () => {
      const params = {
        data: {
          id: 'postId',
          tags: [{ id: 'tags1' }, { id: 'tags2' }],
          tagsIds: ['tags1', 'tags2'],
          author: { id: 'author1' },
          title: 'Foo'
        },
        previousData: {
          tags: [{ id: 'tags1' }],
          tagsIds: ['tags1']
        }
      };

      expect(
        buildVariables(introspectionResult as unknown as IntrospectionResult)(
          { type: { name: 'Post' } } as Resource,
          UPDATE,
          params
        )
      ).toEqual({
        where: { id: 'postId' },
        data: {
          author: { connect: { id: 'author1' } },
          tags: {
            connect: [{ id: 'tags2' }],
            disconnect: [],
            update: []
          },
          title: 'Foo'
        }
      });
    });

    it('disconnects nodes correctly', () => {
      const params = {
        data: {
          id: 'postId',
          tags: [{ id: 'tags1' }, { id: 'tags2' }],
          tagsIds: ['tags1', 'tags2'],
          author: { id: 'author1' },
          title: 'Foo'
        },
        previousData: {
          tags: [{ id: 'tags1' }, { id: 'tags2' }, { id: 'tags3' }],
          tagsIds: ['tags1', 'tags2', 'tags3']
        }
      };

      expect(
          buildVariables(introspectionResult as unknown as IntrospectionResult)(
              { type: { name: 'Post' } } as Resource,
              UPDATE,
              params
          )
      ).toEqual({
        where: { id: 'postId' },
        data: {
          author: { connect: { id: 'author1' } },
          tags: {
            connect: [],
            disconnect: [{id: 'tags3'}],
            update: []
          },
          title: 'Foo'
        }
      });
    });

    it('can update nested scalars', () => {
      const params = {
        data: {
          id: 'postId',
          tags: [{ id: 'tags1', name: 'test' }, { id: 'tags2' }],
          tagsIds: ['tags1', 'tags2'],
          author: { id: 'author1' },
          title: 'Foo'
        },
        previousData: {
          tags: [{ id: 'tags1', name: 'works' }, { id: 'tags2' }],
          tagsIds: ['tags1', 'tags2']
        }
      };

      expect(
          buildVariables(introspectionResult as unknown as IntrospectionResult)(
              { type: { name: 'Post' } } as Resource,
              UPDATE,
              params
          )
      ).toEqual({
        where: { id: 'postId' },
        data: {
          author: { connect: { id: 'author1' } },
          tags: {
            connect: [],
            disconnect: [],
            update: [{where: {id: 'tags1'}, data: {name: 'test'}}]
          },
          title: 'Foo'
        }
      });

    })
  });

  describe('GET_MANY', () => {
    it('returns correct variables', () => {
      const params = {
        ids: ['tag1', 'tag2']
      };

      expect(
        buildVariables({} as IntrospectionResult)(
          { type: { name: 'Post' } } as Resource,
          GET_MANY,
          params
        )
      ).toEqual({
        where: { id_in: ['tag1', 'tag2'] }
      });
    });
  });

  describe('GET_MANY_REFERENCE', () => {
    it('returns correct variables', () => {
      const params = {
        target: 'author.id',
        id: 'author1'
      };

      expect(
        buildVariables({} as IntrospectionResult)(
          { type: { name: 'Post' } } as Resource,
          GET_MANY_REFERENCE,
          params
        )
      ).toEqual({
        where: { author: { id: 'author1' } }
      });
    });
  });

  describe('DELETE', () => {
    it('returns correct variables', () => {
      const params = {
        id: 'post1'
      };

      expect(
        buildVariables({} as IntrospectionResult)(
          { type: { name: 'Post', inputFields: [] } } as any,
          DELETE,
          params
        )
      ).toEqual({
        where: { id: 'post1' }
      });
    });
  });
});
