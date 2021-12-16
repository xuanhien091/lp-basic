# Scss convention

- Add blank line

```scss
// bad
.example {
  display: block;
  @include text();
}

// good
.example {
  display: block;

  @include text();
}
```

```scss
// bad
.example {
  display: block;
  &_item {
    display: flex;
  }
}

// good
.example {
  display: block;

  &_item {
    display: flex;
  }
}
```

- always use $ value

```scss
// bad
.example {
  font-size: 10px;
  color: #fff;
}

// good
.example {
  font-size: $font-md;
  color: $white;
}
```
