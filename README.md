# tableList
A simple library to display data table. Allow sorting based on column values, row selection/expanding, and sticky header.

<!-- #Install 

```sh
npm install tablelist
```

## Usage

The package includes exports for raw svelte by using `import SvelteTable from "svelte-table"`

```html
<script>
  import TableList from "tablelist";
  const data = [
    /** data (example below) */
  ];
  const columns = [
    /** columns config (example below) */
  ];
</script>

<TableList selectorId="main" top={0} columns={columns} data={data}></SvelteTable>
``` -->

## Sample Data and config

```js
// define some sample data...
const rows = [
  { id: 1, first_name: "Marilyn", last_name: "Monroe", pet: "dog" },
  { id: 2, first_name: "Abraham", last_name: "Lincoln", pet: "dog" },
  { id: 3, first_name: "Mother", last_name: "Teresa", pet: "" },
  { id: 4, first_name: "John F.", last_name: "Kennedy", pet: "dog" },
  { id: 5, first_name: "Martin Luther", last_name: "King", pet: "dog" },
  { id: 6, first_name: "Nelson", last_name: "Mandela", pet: "cat" },
  { id: 7, first_name: "Winston", last_name: "Churchill", pet: "cat" },
  { id: 8, first_name: "George", last_name: "Soros", pet: "bird" },
  { id: 9, first_name: "Bill", last_name: "Gates", pet: "cat" },
  { id: 10, first_name: "Muhammad", last_name: "Ali", pet: "dog" },
  { id: 11, first_name: "Mahatma", last_name: "Gandhi", pet: "bird" },
  { id: 12, first_name: "Margaret", last_name: "Thatcher", pet: "cat" },
  { id: 13, first_name: "Christopher", last_name: "Columbus", pet: "dog" },
  { id: 14, first_name: "Charles", last_name: "Darwin", pet: "dog" },
  { id: 15, first_name: "Elvis", last_name: "Presley", pet: "dog" },
  { id: 16, first_name: "Albert", last_name: "Einstein", pet: "dog" },
  { id: 17, first_name: "Paul", last_name: "McCartney", pet: "cat" },
  { id: 18, first_name: "Queen", last_name: "Victoria", pet: "dog" },
  { id: 19, first_name: "Pope", last_name: "Francis", pet: "cat" },
  // etc...
];

// define column configs
const columns = [
  {
    key: "id",
    title: "ID",
    value: v => v.id,
    sortable: true,
  },
  {
    key: "first_name",
    title: "FIRST_NAME",
    value: v => v.first_name,
    sortable: true,
  },
  {
    key: "last_name",
    title: "LAST_NAME",
    value: v => v.last_name,
    sortable: true,
  },
  {
    key: "pet",
    title: "Pet",
    value: v => v.pet,
    sortable: true,
  },
];
```

## Props

| Option                     | Type            | Default         | Description                                              |
| -------------------------- | --------------- | -------------------------------------------------------------------------- |
| `selectorId`               | String          |                 | main scrollable container ID                                        |
| `columns`                  | Object[]        | []              | column config (details below)                            |
| `data`                     | Object[]        | []              | row (data) array                                         |
| `containerHeight`          | Number          | 0               | _optional_ set table height                              |
| `top`                      | Number          | 0               | position of sticky header                                |
| `zIndex`                   | Number          | 0               | index of sticky header                                   |
| `loading`                  | Boolean         | true            | ‡ trigger loading skeleton                               |
| `isClickable`              | Boolean         | true            | add cursor pointer on row and trigger click function     |
| `isExpand`                 | Boolean         | false           | ‡ trigger loading skeleton                               |
| `expandComponent`          | Boolean         |                 | component to render expanded row                         |
| `emptyText`                | Boolean         | Data not found! | will render if data is empty                           |
| `backgroundColor`          | Object{}        | {}              | background color config (details below)                  |
| `textColor`                | Object{}        | {}              | text color config (details below)                        |

_‡_ field allows 2-way binding

### Events

Events pass a CustomEvent object with the following params in the `detail` object

| event         | detail parameters     | Description                                                                                                 |
| ------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `click`       | `key`, `row`          | click on column                                                                                             |
| `sort`        | `key`, `sort`         | click on header to sorting data (the value of sort is _null_, _asc_, _desc_)                                |
| `bottom`      |                       | append new data (use this if you want streams data from a remote server as the user scrolls down the table) |

## Column array object values

| Option                | Type           | Description                                                                                            |
| --------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `key`                 | String         | Unique key identifying the column                                                                      |
| `title`               | String         | Title for header                                                                                       |
| `value`               | Function       | table cell value. The function is passed row data                                                      |
| `[class]`             | String         | _optional_ table cell class name                                                                       |
| `[headerClass]`       | String         | _optional_ class to assign to header element                                                           |
| `[renderComponent]`   | Component      | _optional_ pass a Svelte component, it will receive `col` variables                                    |

### `renderComponent`

Defining a component can be done directly by passing the component as a value

```js
[
  {
    key: "myColumn",
    //...
    renderComponent: myComponent,
  },
];
```

## Background color array object values

| Option                | Type           | Description                            |
| --------------------- | -------------- | -------------------------------------- |
| `base`                | String         | Background color for table             |
| `header`              | String         | Background color for header            |
| `loader`              | String         | Background color for loading skeleton  |
| `hover`               | String         | Background color for hovering row      |
| `expanded`            | String         | Background color when expand is open   |

## Text color array object values

| Option                | Type           | Description                      |
| --------------------- | -------------- | -------------------------------- |
| `default`             | String         | Text color for table             |
| `header`              | String         | Text color for header            |

It has been inspired by:
- [sticky-table-headers](https://launchhubstudio.com/blog/sticky-table-headers)
- [svelte-table](https://github.com/dasDaniel/svelte-table)