import React, {useEffect} from "react";
import styled from 'styled-components'
import {
  useTable,
  usePagination,
  useSortBy,
  useFilters,
  useGroupBy,
  useExpanded,
  useRowSelect,
} from 'react-table'
import matchSorter from 'match-sorter'

// Define a default UI for filtering
function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
  }) {
    const count = preFilteredRows.length
  
    return (
      <input
        value={filterValue || ''}
        onChange={e => {
          setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
        }}
        placeholder={`Search ${count} records...`}
      />
    )
}

function fuzzyTextFilterFn(rows, id, filterValue) {
    return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val


const IndeterminateCheckbox = React.forwardRef(
({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
    <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
    </>
    )
})

  
// Be sure to pass our updateMyData and the skipReset option
const Table = ({ columns, data, fetchData, rowsPerPage, updateMyData, skipReset, isDebug = false }) => {
    const filterTypes = React.useMemo(
      () => ({
        // Add a new fuzzyTextFilterFn filter type.
        fuzzyText: fuzzyTextFilterFn,
        // Or, override the default text filter to use
        // "startWith"
        text: (rows, id, filterValue) => {
          return rows.filter(row => {
            const rowValue = row.values[id]
            return rowValue !== undefined
              ? String(rowValue)
                  .toLowerCase()
                  .startsWith(String(filterValue).toLowerCase())
              : true
          })
        },
      }),
      []
    )
  
    const defaultColumn = React.useMemo(
      () => ({
        // Let's set up our default Filter UI
        Filter: DefaultColumnFilter,
        // And also our default editable cell
        // Cell: EditableCell,
      }),
      []
    )
  
    // Use the state and functions returned from useTable to build your UI
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      prepareRow,
      page, // Instead of using 'rows', we'll use page,
      // which has only the rows for the active page
  
      // The rest of these things are super handy, too ;)
      canPreviousPage,
      canNextPage,
      pageOptions,
      pageCount,
      gotoPage,
      nextPage,
      previousPage,
      setPageSize,
      state: {
        pageIndex,
        pageSize,
        sortBy,
        groupBy,
        expanded,
        filters,
        selectedRowIds,
      },
    } = useTable(
                  {
                    columns,
                    data,
                    initialState: { pageSize: rowsPerPage[0] } ,
                    defaultColumn,
                    filterTypes,
                    // updateMyData isn't part of the API, but
                    // anything we put into these options will
                    // automatically be available on the instance.
                    // That way we can call this function from our
                    // cell renderer!
                    updateMyData,
                    // We also need to pass this so the page doesn't change
                    // when we edit the data.
                    autoResetPage: !skipReset,
                    autoResetSelectedRows: !skipReset,
                    disableMultiSort: true,
                  },
                  useFilters,
                  useGroupBy,
                  useSortBy,
                  useExpanded,
                  usePagination,
                  useRowSelect,
                  // Here we will use a plugin to add our selection column
                  // hooks => {
                  //   hooks.visibleColumns.push(columns => {
                  //     return [
                  //       {
                  //         id: 'selection',
                  //         // Make this column a groupByBoundary. This ensures that groupBy columns
                  //         // are placed after it
                  //         groupByBoundary: true,
                  //         // The header can use the table's getToggleAllRowsSelectedProps method
                  //         // to render a checkbox
                  //         Header: ({ getToggleAllRowsSelectedProps }) => (
                  //           <div>
                  //             <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                  //           </div>
                  //         ),
                  //         // The cell can use the individual row's getToggleRowSelectedProps method
                  //         // to the render a checkbox
                  //         Cell: ({ row }) => (
                  //           <div>
                  //             <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                  //           </div>
                  //         ),
                  //       },
                  //       ...columns,
                  //     ]
                  //   })
                  // }
                )

    useEffect(() => {

      console.log("fetchData is being called #2 : ", pageIndex, pageSize)
      fetchData && fetchData({ pageIndex, pageSize });
    }, [fetchData, pageIndex, pageSize]);
  
    // Render the UI for your table
    return (
      <div>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => 
                    {
                        return <th {...column.getHeaderProps()}>
                                    <div>
                                    {column.canGroupBy ? (
                                        // If the column can be grouped, let's add a toggle
                                        <span {...column.getGroupByToggleProps()}>
                                        {column.isGrouped ? '🛑 ' : '👊 '}
                                        </span>
                                    ) : null}
                                    <span {...column.getSortByToggleProps()}>
                                        {column.render('Header')}
                                        {/* Add a sort direction indicator */}
                                        {column.isSorted
                                        ? column.isSortedDesc
                                            ? ' 🔽'
                                            : ' 🔼'
                                        : ''}
                                    </span>
                                    </div>
                                    {/* Render the columns filter UI */}
                                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                                </th>
                    }
                )}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <td {...cell.getCellProps()}>
                        {cell.isGrouped ? (
                          // If it's a grouped cell, add an expander and row count
                          <>
                            <span {...row.getToggleRowExpandedProps()}>
                              {row.isExpanded ? '👇' : '👉'}
                            </span>{' '}
                            {cell.render('Cell', { editable: false })} (
                            {row.subRows.length})
                          </>
                        ) : cell.isAggregated ? (
                          // If the cell is aggregated, use the Aggregated
                          // renderer for cell
                          cell.render('Aggregated')
                        ) : cell.isPlaceholder ? null : ( // For cells with repeated values, render null
                          // Otherwise, just render the regular cell
                          cell.render('Cell', { editable: true })
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        {/*
          Pagination can be built however you'd like.
          This is just a very basic UI implementation:
        */}

        {
            data.length <  rowsPerPage[0] 
            ?   <></>
            :   <div className="pagination">
                    <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {'<<'}
                    </button>{' '}
                    <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {'<'}
                    </button>{' '}
                    <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                    </button>{' '}
                    <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {'>>'}
                    </button>{' '}
                    <span>
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                    </span>
                    <span>
                    | Go to page:{' '}
                    <input
                      type="number"
                      defaultValue={pageIndex + 1}
                      onChange={e => {
                        const page = e.target.value ? Number(e.target.value) - 1 : 0
                        gotoPage(page)
                      }}
                      style={{ width: '100px' }}/>
                    </span>{' '}
                    <select
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value))
                    }}>
                    {rowsPerPage.map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                        </option>
                    ))}
                    </select>
                </div>
        }

        

        {
            isDebug 
            ?   <pre>
                    <code>
                    {JSON.stringify(
                        {
                        pageIndex,
                        pageSize,
                        pageCount,
                        canNextPage,
                        canPreviousPage,
                        sortBy,
                        groupBy,
                        expanded: expanded,
                        filters,
                        selectedRowIds: selectedRowIds,
                        },
                        null,
                        2
                    )}
                    </code>
                </pre> 
            :   <div />

        }
        
      </div>
    )
}

export default Table