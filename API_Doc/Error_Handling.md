## ⚠️ Error Handling

### Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `UNAUTHORIZED` | Invalid credentials or expired token | Re-authenticate |
| `CONFLICT` | Username/email already exists | Use different credentials |
| `NOT_FOUND` | Resource not found | Verify input data |
| `BAD_REQUEST` | Invalid input data or already verified | Check validation rules or status |
| `INTERNAL_SERVER_ERROR` | Server error | Retry or contact support |

### Error Handling Pattern

Handle errors based on the response codes and messages. For example, for unauthorized access, prompt the user to re-authenticate. For BAD_REQUEST, check if the input is valid or if the action is unnecessary (e.g., already verified).

---