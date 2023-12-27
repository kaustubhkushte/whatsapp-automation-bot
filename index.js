const { Client,LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017';
const SESSION_MODEL_NAME = 'whatsappSession';

const SessionSchema = new mongoose.Schema({
  clientName: String,
  session: Object,
});

const Session = mongoose.model(SESSION_MODEL_NAME, SessionSchema);

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const client = new Client({
    session: await getSession(),
    authStrategy: new LocalAuth()
  });

  client.initialize();

  client.on('qr', (qrCode) => {
    console.log('Scan this QR code with your phone:');
    qrcode.generate(qrCode, { small: true });
  });

  client.on('authenticated', async (session) => {
    console.log('Authenticated. Saving session.');
    await saveSession(session);
  });

  client.on('ready', () => {
    console.log('Client is ready.');
  });

  client.on('message', async (message) => {
    // Replace 'TARGET_NUMBER' with the number you want to forward messages to
    let contact = await message.getContact();
    console.log(contact);
    const sourceNumber = '918433721719@c.us';
    const destinationNumber = '919945956200@c.us';

    if (message.from === sourceNumber) {
      const chat = await client.getChatById(destinationNumber);     
      chat.sendMessage(`New Message from ${message.from}: ${message.body}`);
    }
  });
}

async function getSession() {
  const savedSession = await Session.findOne({ clientName: 'whatsapp' });
  return savedSession ? savedSession.session : null;
}

async function saveSession(sessionData) {
  await Session.findOneAndUpdate({ clientName: 'whatsapp' }, { session: sessionData }, { upsert: true });
}

main().catch(console.error);
