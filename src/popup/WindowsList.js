import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import browser from 'webextension-polyfill'
import { eventValueExtractor, preventingDefault } from '@accurat/event-utils'
import TextField, { Input } from '@material/react-text-field'

const currentWindowId = 223
export const DELETE_TIMEOUT = 500000

@inject('state')
@observer
export default class WindowsList extends Component {
  render() {
    const { windows } = this.props.state

    // need to handle the fact that the trashBin contains the already deleted windows,
    // so its length is greater than the savedList or editingList
    let deletedIndex = 0

    return (
      <>
        <div class="header">
          <button class="mdc-button mdc-button--raised">
            <i class="material-icons mdc-button__icon" aria-hidden="true">
              save_alt
            </i>
            Save current tabs
          </button>
        </div>
        <div class="tabs-list">
          <div class="mdc-list mdc-list--avatar-list" id="saved-windows-container">
            {windows.trashBin.map((deletedWindow, i) => {
              if (deletedWindow) {
                deletedIndex++
                const deleteTimeout = setTimeout(
                  () => windows.deletePermanently(deletedWindow),
                  DELETE_TIMEOUT,
                )
                return (
                  <div
                    key={deletedWindow.id}
                    class={`mdc-list-item ${
                      window.id === currentWindowId ? 'mdc-list-item--selected' : ''
                    }`}
                  >
                    <div class="mdc-snackbar mdc-snackbar--active">
                      <div class="mdc-snackbar__text">
                        Successfully deleted {deletedWindow.name}.
                      </div>
                      <div class="mdc-snackbar__action-wrapper">
                        <button
                          type="button"
                          class="mdc-snackbar__action-button"
                          onClick={() => {
                            clearTimeout(deleteTimeout)
                            windows.unDelete(deletedWindow)
                          }}
                        >
                          Undo
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              const editedWindow = windows.editingList[i - deletedIndex]
              if (editedWindow) {
                return (
                  <form
                    key={editedWindow.id}
                    class={`mdc-list-item ${
                      window.id === currentWindowId ? 'mdc-list-item--selected' : ''
                    }`}
                    onSubmit={preventingDefault(() => windows.applyEdit(editedWindow))}
                  >
                    <div class="mdc-list-item__emoji">
                      <TextField label="emoji">
                        <Input
                          value={editedWindow.emoji}
                          onChange={eventValueExtractor(editedWindow.setEmoji)}
                          required="required"
                        />
                      </TextField>
                    </div>

                    <TextField label="text">
                      <Input
                        value={editedWindow.name}
                        onChange={eventValueExtractor(editedWindow.setName)}
                        required="required"
                      />
                    </TextField>

                    <button
                      type="submit"
                      class="button-reset mdc-list-item__meta material-icons hover-blue"
                    >
                      check
                    </button>
                    <i
                      class="mdc-list-item__meta material-icons hover-red"
                      onClick={() => windows.delete(editedWindow)}
                    >
                      delete
                    </i>
                  </form>
                )
              }

              const savedWindow = windows.savedList[i - deletedIndex]
              return (
                <div
                  key={savedWindow.id}
                  class={`mdc-list-item ${
                    window.id === currentWindowId ? 'mdc-list-item--selected' : ''
                  }`}
                >
                  <div class="mdc-list-item__clickable-area">
                    <div class="mdc-list-item__emoji">{savedWindow.emoji}</div>
                    {savedWindow.name}
                  </div>
                  <i
                    class="mdc-list-item__meta material-icons hover-blue"
                    onClick={() => windows.edit(savedWindow)}
                  >
                    edit
                  </i>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }
}
