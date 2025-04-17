def hash_password(password):
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def check_password(password, hash_val):
    return hash_password(password) == hash_val

def is_strong_password(password):
    return len(password) >= 8 and any(c.isdigit() for c in password)
