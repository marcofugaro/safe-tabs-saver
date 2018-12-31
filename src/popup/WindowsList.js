import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { eventValueExtractor, preventingDefault } from '@accurat/event-utils'
import TextField, { Input } from '@material/react-text-field'

export const DELETE_TIMEOUT = 5000

export default
@inject('state')
@observer
class WindowsList extends Component {
  render() {
    const { state } = this.props

    // need to handle the fact that the trashBin contains the already deleted windows,
    // so its length is greater than the savedList or editingList
    let deletedIndex = 0

    return (
      <>
        <div class="header">
          {!state.focusedWindowId && (
            <button class="mdc-button mdc-button--raised" onClick={state.addCurrent}>
              <i class="material-icons mdc-button__icon" aria-hidden="true">
                save_alt
              </i>
              Save current tabs
            </button>
          )}
        </div>
        <div class="tabs-list">
          <div class="mdc-list mdc-list--avatar-list" id="saved-windows-container">
            {state.trashBin.map((deletedWindow, i) => {
              if (deletedWindow) {
                deletedIndex++
                const deleteTimeout = setTimeout(
                  () => state.deletePermanently(deletedWindow),
                  DELETE_TIMEOUT,
                )
                return (
                  <div key={deletedWindow.id} class={`mdc-list-item`}>
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
                            state.unDelete(deletedWindow)
                          }}
                        >
                          Undo
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              const editedWindow = state.editingList[i - deletedIndex]
              if (editedWindow) {
                return (
                  <form
                    key={editedWindow.id}
                    class={`
                      mdc-list-item
                      ${editedWindow.id === state.focusedWindowId ? 'mdc-list-item--selected' : ''}
                    `}
                    onSubmit={preventingDefault(() => state.applyEdit(editedWindow))}
                  >
                    <TextField label="emoji" class="mdc-list-item__emoji-input">
                      <Input
                        value={editedWindow.emoji}
                        onChange={eventValueExtractor(editedWindow.setEmoji)}
                        required="required"
                      />
                    </TextField>

                    <TextField label="text" class="mdc-list-item__input">
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
                      onClick={() => state.delete(editedWindow)}
                    >
                      delete
                    </i>
                  </form>
                )
              }

              const savedWindow = state.savedList[i - deletedIndex]
              return (
                <div
                  key={savedWindow.id}
                  class={`
                    mdc-list-item
                    ${savedWindow.id === state.focusedWindowId ? 'mdc-list-item--selected' : ''}
                    `}
                >
                  <div
                    class={`
                    mdc-list-item__clickable-area
                  `}
                    onClick={savedWindow.id === state.focusedWindowId ? null : savedWindow.open}
                  >
                    <div class="mdc-list-item__emoji">{savedWindow.emoji}</div>
                    {savedWindow.name}
                  </div>
                  <i
                    class="mdc-list-item__meta material-icons hover-blue"
                    onClick={() => state.edit(savedWindow)}
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
