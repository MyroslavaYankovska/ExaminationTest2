import post from '../fixtures/post.json';
import { faker } from '@faker-js/faker';
import user from '../fixtures/user.json';
import UserPost from '../fixtures/UserPost.json'

user.email = faker.internet.email();
user.password = faker.internet.password(15);
UserPost.userId = faker.finance.account(1);
UserPost.title = faker.random.words();
UserPost.body = faker.random.word();
UserPost.id = user.id;

//1
it('Get all posts. Verify HTTP response status code and content type.', () => {
  cy.log('Get all posts');
  cy.request('GET', '/posts', post).then( response => {
    console.log(response);
    expect(response.status).to.be.equal(200);
    expect(response.statusText).to.be.equal('OK');
    expect(response.isOkStatusCode).to.be.true;
    expect(response.body.length).to.be.equal(response.body.filter(post=>post).length); 
  })
})

//2
it('Get only first 10 posts. Verify HTTP response status code. Verify that only first posts are returned.', () => {
  cy.log('Get only first 10 posts');
  cy.request('GET', '/posts?_start=0&_end=10', post).then( response => {
    console.log(response);
    expect(response.status).to.be.equal(200);
    expect(response.statusText).to.be.equal('OK');
    expect(response.isOkStatusCode).to.be.true;
    expect(response.body.length).to.be.equal(post.slice(0, 10).length);
  })
})

//3
it('Get posts with id = 55 and id = 60. Verify HTTP response status code. Verify id values of returned records', () => {
  cy.log('Get id = 55 and id = 60');
  cy.request('GET', '/posts?id=55&id=60', post).then( response => {
    console.log(response);
    expect(response.status).to.be.equal(200);
    expect(response.statusText).to.be.equal('OK');
    expect(response.isOkStatusCode).to.be.true;
    expect(response.body.map(item => item.id)).to.include(55);
    expect(response.body.map(item => item.id)).to.include(60);
  })
})

//4
it('Create a post. Verify HTTP response status code', () => {
  cy.log('Create a post');
  const nonExistedId = 5555555;
  cy.request({
    method: 'PUT',
    url: `/posts/${nonExistedId}`,
    body: {
      "title": UserPost.title,
      "body": UserPost.body,
      "userID": UserPost.userId
    },
    failOnStatusCode: false,
  }).then(response => {
    console.log(response);
    expect(response.status).to.be.equal(404);
  })
})

//5 
it('Create post with adding access token in header. Verify HTTP response status code. Verify post is created.', () => {
  cy.log('Create post with adding access token');
  cy.request({
    method: 'POST',
    url: '/posts/register',
    body: {
      "email": user.email,
      "password": user.password
    }
  }).then((response) => {
    expect(response.status).to.equal(201);
    return response.body
  }).then(({ accessToken }) => {
    return cy.request({
      method: 'POST',
      url: '/664/posts',
      headers: { Authorization: `Bearer ${accessToken}`},
      body: {
        "id": user.id,
        "title": UserPost.title,
        "body": UserPost.body,
        "userID": UserPost.userId
      }
    })
  }).then((response) => {
    expect(response.status).to.equal(201);
    expect(response.body.title).to.equal(UserPost.title);
    expect(response.body.body).to.equal(UserPost.body);
    expect(response.body.userID).to.equal(UserPost.userId);

  })
})

// 6
it('Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.', () => {
  cy.log('Create a post entity');
  cy.request({
    method: 'POST',
    url: '/posts',
    body: {
      "id": user.id,
      "title": UserPost.title,
      "body": UserPost.body,
      "userID": UserPost.userId
    }
  }).then((response) => {
    console.log(response);
    expect(response.status).to.equal(201);
    expect(response.body.title).to.equal(UserPost.title);
    expect(response.body.body).to.equal(UserPost.body);

  })
});

//7
it('Update non-existing entity. Verify HTTP response status code.', () => {
  cy.log('Update non-existing entity');
  const nonExistedId = 8888888
  cy.request({
    method: 'PUT',
    url: `/posts/${nonExistedId}`,
    body: {
      "title": 'Updated title',
      "body": 'Updated body',
    },
    failOnStatusCode: false,
  }).then(response => {
    console.log(response);
    expect(response.status).to.be.equal(404);
  })
})

// 8
it('Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.', () => {
  cy.log('Create post entity');
  cy.request({
    method: 'POST',
    url: '/posts',
    body: {
      "id": user.id,
      "title": UserPost.title,
      "body": UserPost.body,
      "userID": UserPost.userId
    }
  }).then((response) => {
    expect(response.status).to.equal(201);
    return response.body
  }).then((body) => {
    cy.log('update the created entity')
    return cy.request({
      method: 'PUT',
      url: `/posts/${body.id}`,
      body: {
        "title": 'Updated title',
        "body": 'Updated body',
      }
    }).then(response => {
      expect(response.status).to.equal(200);
      expect(response.body.title).to.equal('Updated title');
      expect(response.body.body).to.equal('Updated body');
    })
  })
})

//9
it('Delete non-existing post entity. Verify HTTP response status code.', () => {
  cy.log('Delete post entity');
  const nonExistedId = 999999999;
  cy.request({
    method: 'DELETE',
    url: `/posts/${nonExistedId}`,
    failOnStatusCode: false,
  }).then(response => {
    console.log(response);
    expect(response.status).to.be.equal(404);
  })
})

//10
it('Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.', () => {
  cy.log('Delete post entityCreate post entity, update the created entity, and delete the entity');

  cy.request('POST', '/posts', UserPost)
    .then(response => {
      expect(response.status).to.equal(201);
      return response.body
    })
    .then((createdPost) => {
      return cy.request('PUT', `/posts/${createdPost.id}`, {
        title: 'Updated title',
        body: 'Updated body',
      });
    })
    .then(response => {
      expect(response.status).to.equal(200);
      expect(response.body.title).to.equal('Updated title');
      expect(response.body.body).to.equal('Updated body');
      return cy.request('DELETE', `/posts/${response.body.id}`)
    })
    .then((response) => {
   
      expect(response.status).to.equal(200);
    })
})