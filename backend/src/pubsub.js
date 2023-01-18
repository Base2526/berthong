import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
pubsub.ee.setMaxListeners(100); // raise max listeners in event emitter

export default pubsub;