import { Downgraded, useHookstate } from "@hookstate/core";
import { Avatar, Box, Button, TextField, Typography } from "@mui/material";
import { api } from "../../../core/api";
import { globalStore } from "../../../core/store";

const Messages = (props) => {
  const store = useHookstate(globalStore);
  const messageText = useHookstate("");
  const messageFiles = useHookstate([]);
  const users = [...store.room.users.get(), ...store.room.usersWhoLeft.get()];

  const sendMessage = () => {
    const formData = new FormData();
    messageFiles
      .attach(Downgraded)
      .get()
      .forEach((file) => formData.append("files", file));
    formData.append("text", messageText.get());
    api.post(`room/${store.room._id.get()}/message/send`, formData).then(() => {
      messageText.set("");
      messageFiles.set([]);
    });
  };

  return (
    <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
      <Box display="flex" flexDirection="column" flex="1" overflow="auto">
        {store.messages.get().map((message, idx) => {
          const ownMessage = message.sender === store.user._id.get();
          return (
            <Box key={idx} my={1} alignSelf={ownMessage ? "flex-end" : "flex-start"} display="flex" flexDirection="row">
              <Avatar src={users.find((user) => user._id === message.sender).picture} referrerPolicy="no-referrer" />
              <Box
                ml={1}
                p={1}
                display="flex"
                flexWrap="wrap"
                maxWidth={200}
                style={{
                  borderRadius: 32,
                  background: ownMessage ? "silver" : "green",
                }}
                color="white"
              >
                <Typography style={{ overflow: "auto", wordWrap: "break-word" }}>{message.text}</Typography>
                {message.files.map((file, idx) => (
                  <li key={idx}>
                    <a href={`/api/file/${file.id}/download`} download>
                      {file.filename}
                    </a>
                  </li>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box display="flex" mt={2}>
        <TextField
          fullWidth
          variant="outlined"
          label="Message"
          value={messageText.get()}
          onChange={(e) => messageText.set(e.target.value)}
        />
        <Button variant="outlined" component="label">
          File
          <input
            type="file"
            hidden
            multiple
            onChange={(e) => {
              messageFiles.set([...e.target.files]);
            }}
          />
        </Button>
        <Button onClick={sendMessage} variant="outlined">
          Send
        </Button>
      </Box>
      <Box display="flex" flexDirection="column">
        {messageFiles.get().map((file, idx) => (
          <Box key={idx} mt={1}>
            <Button
              style={{ justifyContent: "flex-start" }}
              fullWidth
              variant="outlined"
              onClick={() => messageFiles.set(messageFiles.get().filter((f) => f !== file))}
            >
              {file.name}
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Messages;
